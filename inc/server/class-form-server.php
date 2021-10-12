<?php
/**
 * Card server logic.
 *
 * @package ThemeIsle\GutenbergBlocks\Server
 */

namespace ThemeIsle\GutenbergBlocks\Server;

use ThemeIsle\GutenbergBlocks\Integration\Mailchimp_Integration;
use ThemeIsle\GutenbergBlocks\Integration\Sendinblue_Integration;

/**
 * Class Plugin_Card_Server
 */
class Form_Server {

	/**
	 * The main instance var.
	 *
	 * @var Form_Server
	 */
	public static $instance = null;

	/**
	 * Rest route namespace.
	 *
	 * @var Form_Server
	 */
	public $namespace = 'themeisle-gutenberg-blocks/';

	/**
	 * Rest route version.
	 *
	 * @var Form_Server
	 */
	public $version = 'v1';

	/**
	 * Initialize the class
	 */
	public function init() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register REST API route
	 */
	public function register_routes() {
		$namespace = $this->namespace . $this->version;
		register_rest_route(
			$namespace,
			'/forms',
			array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'submit_form' ),
					'permission_callback' => function () {
						return __return_true();
					},
				),
			)
		);
		register_rest_route(
			$namespace,
			'/integration',
			array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'get_integration_data' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);
	}


	/**
	 * Handle the request from the form block
	 *
	 * @param mixed $request Form request.
	 *
	 * @return mixed|\WP_REST_Response
	 */
	public function submit_form( $request ) {

		$data = json_decode( $request->get_body(), true );
		$data = $this->sanitize_data( $data );

		if ( ! $this->has_requiered_data( $data ) ) {
			$return['error']   = __( 'Invalid request!', 'otter-blocks' );
			$return['reasons'] = __( 'Essential data is missing!', 'otter-blocks' );
			return $return;
		}

		$reasons = $this->check_form_conditions( $data );

		if ( 0 < count( $reasons ) ) {
			$return['error']   = __( 'Invalid request!', 'otter-blocks' );
			$return['reasons'] = $reasons;
			return $return;
		}

		if ( isset( $data['token'] ) ) {
			$secret = get_option( 'themeisle_google_captcha_api_secret_key' );
			$resp   = wp_remote_post(
				'https://www.google.com/recaptcha/api/siteverify',
				array(
					'body'    => 'secret=' . $secret . '&response=' . $data['token'],
					'headers' => [
						'Content-Type' => 'application/x-www-form-urlencoded',
					],
				)
			);
			$result = json_decode( $resp['body'], true );
			if ( false == $result['success'] ) {
				$return['error'] = __( 'The reCaptha was invalid!', 'otter-blocks' );
				return rest_ensure_response( $return );
			}
		}

		$integration = $this->get_form_option_settings( $data['formOption'] );

		if ( isset( $integration['provider'] ) && isset( $integration['listId'] ) && isset( $integration['action'] ) && isset( $data['action'] ) && ( 'subscribe' === $data['action'] || 'submit-subscribe' === $data['action'] ) ) {
			if ( 'subscribe' === $data['action'] ) {
				switch ( $integration['provider'] ) {
					case 'mailchimp':
						return $this->subscribe_to_mailchimp( $data );
					case 'sendinblue':
						return $this->subscribe_to_sendinblue( $data );
				}
			} elseif ( 'submit-subscribe' === $data['action'] && isset( $data['consent'] ) && $data['consent'] ) {
				switch ( $integration['provider'] ) {
					case 'mailchimp':
						$this->subscribe_to_mailchimp( $data );
						break;
					case 'sendinblue':
						$this->subscribe_to_sendinblue( $data );
						break;
				}
			}
		}

		return $this->send_email( $data );
	}

	/**
	 * Send Email using SMTP
	 *
	 * @param mixed $data Data from request body.
	 *
	 * @return mixed|\WP_REST_Response
	 */
	private function send_email( $data ) {
		$return = array(
			'success' => false,
		);

		$email_subject = ( isset( $data['emailSubject'] ) ? $data['emailSubject'] : ( __( 'A new form submission on ', 'otter-blocks' ) . get_bloginfo( 'name' ) ) );
		$email_body    = $this->prepare_body( $data['data'] );

		// Sent the form date to the admin site as a default behaviour.
		$to = sanitize_email( get_site_option( 'admin_email' ) );

		// Check if we need to send it to another user email.
		if ( isset( $data['formOption'] ) ) {
			$option_name = sanitize_text_field( $data['formOption'] );
			$form_emails = get_option( 'themeisle_blocks_form_emails' );

			foreach ( $form_emails as $form ) {
				if ( $form['form'] === $option_name ) {
					$to = $form['email'];
				}
			}
		}

		$headers = array( 'Content-Type: text/html; charset=UTF-8', 'From: ' . esc_url( get_site_url() ) );

		try {
			// phpcs:ignore
			wp_mail( $to, $email_subject, $email_body, $headers );
			$return['success'] = true;
		} catch ( \Exception $e ) {
			$return['error'] = $e->getMessage();
		} finally {
			return rest_ensure_response( $return );
		}
	}

	/**
	 * Body template preparation
	 *
	 * @param array $data Data from the forms.
	 *
	 * @return string
	 */
	private function prepare_body( $data ) {
		ob_start(); ?>
		<!doctype html>
		<html xmlns="http://www.w3.org/1999/xhtml">
		<head>
			<meta http-equiv="Content-Type" content="text/html;" charset="utf-8"/>
			<!-- view port meta tag -->
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
			<title><?php esc_html__( 'Mail From: ', 'otter-blocks' ) . sanitize_email( get_site_option( 'admin_email' ) ); ?></title>
		</head>
		<body>
		<table>
			<thead>
			<tr>
				<th colspan="2">
					<h3>
						<?php esc_html_e( 'Content Form submission from ', 'otter-blocks' ); ?>
						<a href="<?php echo esc_url( get_site_url() ); ?>"><?php bloginfo( 'name' ); ?></a>
					</h3>
					<hr/>
				</th>
			</tr>
			</thead>
			<tbody>
			<?php
			foreach ( $data as $input ) {
				?>
				<tr>
					<td>
						<strong><?php echo esc_html( $input['label'] ); ?>: </strong>
						<?php echo esc_html( $input['value'] ); ?>
					</td>

				</tr>
				<?php
			}

			?>
			</tbody>
			<tfoot>
			<tr>
				<td>
					<hr/>
					<?php esc_html_e( 'You received this email because your email address is set in the content form settings on ', 'otter-blocks' ); ?>
					<a href="<?php echo esc_url( get_site_url() ); ?>"><?php bloginfo( 'name' ); ?></a>
				</td>
			</tr>
			</tfoot>
		</table>
		</body>
		</html>
		<?php
		return ob_get_clean();
	}

	/**
	 * Get data about the given provider
	 *
	 * @param \WP_REST_Request $request Search request.
	 * @return mixed|\WP_REST_Response
	 */
	public function get_integration_data( $request ) {
		$return = array(
			'success' => false,
		);

		$data = json_decode( $request->get_body(), true );
		$data = $this->sanitize_data( $data );

		if ( isset( $data['provider'] ) ) {
			switch ( $data['provider'] ) {
				case 'mailchimp':
					return $this->get_mailchimp_data( $request );
				case 'sendinblue':
					return $this->get_sendinblue_data( $request );
			}
		}

		$return['error'] = __( 'Invalid request! Provider is missing.', 'otter-blocks' );
		return rest_ensure_response( $return );
	}

	/**
	 * Get general information from Mailchimp
	 *
	 * @param \WP_REST_Request $request Search request.
	 *
	 * @return mixed|\WP_REST_Response
	 *
	 * @see https://mailchimp.com/developer/marketing/api/list-members/
	 */
	public function get_mailchimp_data( $request ) {
		$return = array(
			'success' => false,
		);
		$data   = json_decode( $request->get_body(), true );

		$valid_api_key = Mailchimp_Integration::validate_api_key( $data['apiKey'] );

		if ( $valid_api_key['valid'] ) {
			$integ = new Mailchimp_Integration( $data['apiKey'] );
			return $integ->get_lists();
		} else {
			$return['error'] = $valid_api_key['reason'];
		}

		return rest_ensure_response( $return );
	}

	/**
	 * Get general information from Sendinblue
	 *
	 * @param \WP_REST_Request $request Search request.
	 *
	 * @return mixed|\WP_REST_Response
	 *
	 * @see https://developers.sendinblue.com/reference/getlists-1
	 */
	public function get_sendinblue_data( $request ) {
		$return = array(
			'success' => false,
		);
		$data   = json_decode( $request->get_body(), true );

		$valid_api_key = Sendinblue_Integration::validate_api_key( $data['apiKey'] );

		if ( $valid_api_key['valid'] ) {
			$integ = new Sendinblue_Integration( $data['apiKey'] );
			return $integ->get_lists();
		} else {
			$return['error'] = $valid_api_key['reason'];
		}

		return rest_ensure_response( $return );
	}

	/**
	 * Add a new subscriber to Mailchimp
	 *
	 * @param mixed $data Data from request body.
	 *
	 * @return mixed|\WP_REST_Response
	 */
	private function subscribe_to_mailchimp( $data ) {

		$return = array(
			'success' => false,
		);

		// Get the first email from form.
		$email = '';
		foreach ( $data['data'] as $input_field ) {
			if ( 'email' == $input_field['type'] ) {
				$email = $input_field['value'];
				break;
			}
		}

		if ( '' === $email ) {
			return rest_ensure_response( $return );
		}

		$integration = $this->get_form_option_settings( $data['formOption'] );

		if ( isset( $integration['apiKey'] ) && '' !== $integration['apiKey'] &&
			isset( $integration['listId'] ) && '' !== $integration['listId']
		) {
			$api_key = $integration['apiKey'];
			$list_id = $integration['listId'];
		}

		if ( '' === $list_id ) {
			return rest_ensure_response( $return );
		}

		$valid_api_key = Mailchimp_Integration::validate_api_key( $api_key );

		if ( $valid_api_key['valid'] ) {
			$mailchimp = new Mailchimp_Integration( $api_key );
			$return    = $mailchimp->subscribe( $list_id, $email );
		} else {
			$return['error'] = $valid_api_key['reason'];
		}

		return rest_ensure_response( $return );
	}

	/**
	 * Add a new subscriber to Sendinblue
	 *
	 * @param mixed $data Data from request body.
	 *
	 * @return mixed|\WP_REST_Response
	 */
	private function subscribe_to_sendinblue( $data ) {

		$return = array(
			'success' => false,
		);

		// Get the first email from form.
		$email = '';
		foreach ( $data['data'] as $input_field ) {
			if ( 'email' == $input_field['type'] ) {
				$email = $input_field['value'];
				break;
			}
		}

		if ( '' === $email ) {
			return rest_ensure_response( $return );
		}

		// Get the api credentials from the Form block.
		$api_key = '';
		$list_id = '';

		$integration = $this->get_form_option_settings( $data['formOption'] );

		if ( isset( $integration['apiKey'] ) && '' !== $integration['apiKey'] &&
			isset( $integration['listId'] ) && '' !== $integration['listId']
		) {
			$api_key = $integration['apiKey'];
			$list_id = $integration['listId'];
		}

		if ( '' === $list_id ) {
			return rest_ensure_response( $return );
		}

		$valid_api_key = Sendinblue_Integration::validate_api_key( $api_key );

		if ( $valid_api_key['valid'] ) {
			$sendinblue = new Sendinblue_Integration( $api_key );
			$return     = $sendinblue->subscribe( $list_id, $email );
		} else {
			$return['error'] = $valid_api_key['reason'];
		}

		return rest_ensure_response( $return );
	}

	/**
	 * Check for requiered data.
	 *
	 * @access private
	 * @param array $data Data from the request.
	 *
	 * @return boolean
	 */
	private function has_requiered_data( $data ) {
		$has_csrf_protection = isset( $data['nonceValue'] ) && wp_verify_nonce( $data['nonceValue'], 'form-verification' );
		return isset( $data['postUrl'] ) && isset( $data['formId'] ) && isset( $data['formOption'] ) && $has_csrf_protection;
	}

	/**
	 * Check if the data request has the data needed by form: captha, integrations.
	 *
	 * @access private
	 * @param array $data Data from the request.
	 *
	 * @return array
	 */
	private function check_form_conditions( $data ) {
		$integration       = $this->get_form_option_settings( $data['formOption'] );
		$reasons           = array();
		$has_captcha       = false;
		$has_creditentials = false;

		if ( isset( $integration['hasCaptcha'] ) ) {
			$has_captcha = $integration['hasCaptcha'];
		}

		if ( $has_captcha && ( ! isset( $data['token'] ) || '' === $data['token'] ) ) {
			$reasons += array(
				__( 'Token is missing!', 'otter-blocks' ),
			);
		}

		if ( isset( $integration['apiKey'] ) && '' !== $integration['apiKey'] &&
			isset( $integration['listId'] ) && '' !== $integration['listId']
		) {
			$has_creditentials = true;
		}

		if ( ! $has_creditentials && $integration['provider'] ) {
			$reasons += array(
				__( 'Provider settings are missing!', 'otter-blocks' ),
			);
		}
		return $reasons;
	}

	/**
	 * Get form settings from options.
	 *
	 * @param string $form_option The name of the option.
	 * @return array Form settings
	 */
	private function get_form_option_settings( $form_option ) {
		$option_name = sanitize_text_field( $form_option );
		$form_emails = get_option( 'themeisle_blocks_form_emails' );

		foreach ( $form_emails as $form ) {
			if ( $form['form'] === $option_name ) {
				if ( isset( $form['integration'] ) ) {
					return $form['integration'];
				}
			}
		}
		return array();
	}

	/**
	 * Sanitize the request data.
	 *
	 * @param array $data The data from the request.
	 * @return array Sanitized field data.
	 */
	private function sanitize_data( $data ) {
		if ( isset( $data['postUrl'] ) ) {
			$data['postUrl'] = sanitize_text_field( $data['postUrl'] );
		}
		if ( isset( $data['formId'] ) ) {
			$data['formId'] = sanitize_text_field( $data['formId'] );
		}
		if ( isset( $data['formOption'] ) ) {
			$data['formOption'] = sanitize_text_field( $data['formOption'] );
		}
		if ( isset( $data['apiKey'] ) ) {
			$data['apiKey'] = sanitize_text_field( $data['apiKey'] );
		}
		if ( isset( $data['provider'] ) ) {
			$data['provider'] = sanitize_text_field( $data['provider'] );
		}
		if ( isset( $data['emailSubject'] ) ) {
			$data['emailSubject'] = sanitize_text_field( $data['emailSubject'] );
		}
		if ( isset( $data['action'] ) ) {
			$data['action'] = sanitize_text_field( $data['action'] );
		}
		if ( isset( $data['token'] ) ) {
			$data['token'] = sanitize_text_field( $data['token'] );
		}
		return $data;
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.0.0
	 * @access public
	 * @return Plugin_Card_Server
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
			self::$instance->init();
		}

		return self::$instance;
	}

	/**
	 * Throw error on object clone
	 *
	 * The whole idea of the singleton design pattern is that there is a single
	 * object therefore, we don't want the object to be cloned.
	 *
	 * @access public
	 * @since 1.0.0
	 * @return void
	 */
	public function __clone() {
		// Cloning instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}

	/**
	 * Disable unserializing of the class
	 *
	 * @access public
	 * @since 1.0.0
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
