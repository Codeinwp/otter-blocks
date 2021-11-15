<?php
/**
 * Library server logic.
 *
 * @package ThemeIsle\GutenbergBlocks\Server
 */

namespace ThemeIsle\GutenbergBlocks\Server;

use WP_Error;

use WP_Query;

/**
 * Class Template_Library_Server
 */
class Template_Library_Server {

	/**
	 * The main instance var.
	 *
	 * @var Template_Library_Server
	 */
	public static $instance = null;

	/**
	 * Rest route namespace.
	 *
	 * @var Template_Library_Server
	 */
	public $namespace = 'otter/';

	/**
	 * Rest route version.
	 *
	 * @var Template_Library_Server
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
			'/templates',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'fetch_templates' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);

		register_rest_route(
			$namespace,
			'/import',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'import_template' ),
					'args'                => array(
						'url'     => array(
							'type'        => 'string',
							'required'    => true,
							'description' => __( 'URL of the JSON file.', 'otter-blocks' ),
						),
						'preview' => array(
							'type'        => 'boolean',
							'default'     => false,
							'description' => __( 'Load for Block Preview.', 'otter-blocks' ),
						),
					),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);
	}

	/**
	 * Function to fetch templates.
	 *
	 * @param \WP_REST_Request $request Rest request.
	 *
	 * @return array|bool|\WP_Error
	 */
	public function fetch_templates( \WP_REST_Request $request ) {
		if ( ! current_user_can( 'edit_posts' ) ) {
			return false;
		}

		$templates_list = array(
			array(
				'title'          => __( 'Header with Features', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'header', 'features', 'services' ),
				'categories'     => array( 'header', 'services' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/03-header-with-features/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/03-header-with-features/screenshot.png',
			),
			array(
				'title'          => __( 'Header with Solid Background', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'header' ),
				'categories'     => array( 'header' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/04-header-solid/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/04-header-solid/screenshot.png',
			),
			array(
				'title'          => __( 'Header with Features', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'header', 'features', 'services' ),
				'categories'     => array( 'header', 'services' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/05-header-with-features/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/05-header-with-features/screenshot.png',
			),
			array(
				'title'          => __( 'Header with Image Background', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'header' ),
				'categories'     => array( 'header' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/06-header-with-background/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/06-header-with-background/screenshot.png',
			),
			array(
				'title'          => __( 'Header with Image', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'header', 'about' ),
				'categories'     => array( 'header', 'about' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/07-header-with-image/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/07-header-with-image/screenshot.png',
			),
			array(
				'title'          => __( 'Header', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'header' ),
				'categories'     => array( 'header' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/08-header-center/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/08-header-center/screenshot.png',
			),
			array(
				'title'          => __( 'Blogger Header', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'header', 'blogger' ),
				'categories'     => array( 'header' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/01-blogger-header/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/01-blogger-header/screenshot.png',
			),
			array(
				'title'          => __( 'Services', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'services' ),
				'categories'     => array( 'services' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/09-services-one/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/09-services-one/screenshot.png',
			),
			array(
				'title'          => __( 'Services', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'services' ),
				'categories'     => array( 'services' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/10-services-two/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/10-services-two/screenshot.png',
			),
			array(
				'title'          => __( 'Services', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'services' ),
				'categories'     => array( 'services' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/11-services-three/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/11-services-three/screenshot.png',
			),
			array(
				'title'          => __( 'Services', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'services' ),
				'categories'     => array( 'services' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/12-services-four/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/12-services-four/screenshot.png',
			),
			array(
				'title'          => __( 'Services', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'services' ),
				'categories'     => array( 'services' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/13-services-five/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/13-services-five/screenshot.png',
			),
			array(
				'title'          => __( 'Services', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'services' ),
				'categories'     => array( 'services' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/14-services-six/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/14-services-six/screenshot.png',
			),
			array(
				'title'          => __( 'Services', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'services' ),
				'categories'     => array( 'services' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/15-services-seven/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/15-services-seven/screenshot.png',
			),
			array(
				'title'          => __( 'Services', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'services' ),
				'categories'     => array( 'services' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/16-services-eight/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/16-services-eight/screenshot.png',
			),
			array(
				'title'          => __( 'Services', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'services' ),
				'categories'     => array( 'services' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/17-services-nine/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/17-services-nine/screenshot.png',
			),
			array(
				'title'          => __( 'Services', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'services' ),
				'categories'     => array( 'services' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/18-services-ten/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/18-services-ten/screenshot.png',
			),
			array(
				'title'          => __( 'Services', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'services' ),
				'categories'     => array( 'services' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/19-services-eleven/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/19-services-eleven/screenshot.png',
			),
			array(
				'title'          => __( 'Content with Left Image', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'about', 'content' ),
				'categories'     => array( 'about', 'content' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/20-content-right/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/20-content-right/screenshot.png',
			),
			array(
				'title'          => __( 'Content with Right Image', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'about', 'content' ),
				'categories'     => array( 'about', 'content' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/21-content-left/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/21-content-left/screenshot.png',
			),
			array(
				'title'          => __( 'Content with Images', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'content' ),
				'categories'     => array( 'content' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/22-content-with-images/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/22-content-with-images/screenshot.png',
			),
			array(
				'title'          => __( 'About with Video', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'about', 'content', 'video' ),
				'categories'     => array( 'about', 'content' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/23-about-with-video/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/23-about-with-video/screenshot.png',
			),
			array(
				'title'          => __( 'FAQ', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'content', 'faq', 'questions' ),
				'categories'     => array( 'content' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/24-faq-plain/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/24-faq-plain/screenshot.png',
			),
			array(
				'title'          => __( 'Content Two Columns', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'about', 'content' ),
				'categories'     => array( 'about', 'content' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/25-content-two-columns/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/25-content-two-columns/screenshot.png',
			),
			array(
				'title'          => __( 'Content with Sharing Icons', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'content' ),
				'categories'     => array( 'content' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/26-content-with-sharing/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/26-content-with-sharing/screenshot.png',
			),
			array(
				'title'          => __( 'Content with Image', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'content' ),
				'categories'     => array( 'content' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/27-content-with-image/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/27-content-with-image/screenshot.png',
			),
			array(
				'title'          => __( 'Video with Features', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'about', 'content', 'services', 'features' ),
				'categories'     => array( 'about', 'content', 'services' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/28-video-with-features/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/28-video-with-features/screenshot.png',
			),
			array(
				'title'          => __( 'Content with Images', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'about', 'content', 'header' ),
				'categories'     => array( 'about', 'content', 'header' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/29-content-with-images/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/29-content-with-images/screenshot.png',
			),
			array(
				'title'          => __( 'Content with Images', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'content' ),
				'categories'     => array( 'content' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/30-content-with-images/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/30-content-with-images/screenshot.png',
			),
			array(
				'title'          => __( 'Content with Images', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'content' ),
				'categories'     => array( 'content' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/31-content-with-images/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/31-content-with-images/screenshot.png',
			),
			array(
				'title'          => __( 'Content with Images', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'content' ),
				'categories'     => array( 'content' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/32-content-with-images/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/32-content-with-images/screenshot.png',
			),
			array(
				'title'          => __( 'Content with Features', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'content', 'features', 'header' ),
				'categories'     => array( 'content', 'header' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/33-content-with-features/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/33-content-with-features/screenshot.png',
			),
			array(
				'title'          => __( 'Blogger About', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'about', 'blogger' ),
				'categories'     => array( 'about' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/02-blogger-about/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/02-blogger-about/screenshot.png',
			),
			array(
				'title'          => __( 'Team', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'team', 'members' ),
				'categories'     => array( 'team' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/34-team-one/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/34-team-one/screenshot.png',
			),
			array(
				'title'          => __( 'Team', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'team', 'members' ),
				'categories'     => array( 'team' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/35-team-two/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/35-team-two/screenshot.png',
			),
			array(
				'title'          => __( 'Team', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'team', 'members' ),
				'categories'     => array( 'team' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/36-team-three/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/36-team-three/screenshot.png',
			),
			array(
				'title'          => __( 'Team', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'team', 'members' ),
				'categories'     => array( 'team' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/37-team-four/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/37-team-four/screenshot.png',
			),
			array(
				'title'          => __( 'Testimonials', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'testimonials', 'review' ),
				'categories'     => array( 'testimonials' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/38-testimonials-one/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/38-testimonials-one/screenshot.png',
			),
			array(
				'title'          => __( 'Testimonials', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'testimonials', 'review' ),
				'categories'     => array( 'testimonials' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/39-testimonials-two/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/39-testimonials-two/screenshot.png',
			),
			array(
				'title'          => __( 'Testimonials', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'testimonials', 'review' ),
				'categories'     => array( 'testimonials' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/40-testimonials-three/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/40-testimonials-three/screenshot.png',
			),
			array(
				'title'          => __( 'Testimonials', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'testimonials', 'review' ),
				'categories'     => array( 'testimonials' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/41-testimonials-four/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/41-testimonials-four/screenshot.png',
			),
			array(
				'title'          => __( 'Testimonials', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'testimonials', 'review' ),
				'categories'     => array( 'testimonials' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/42-testimonials-five/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/42-testimonials-five/screenshot.png',
			),
			array(
				'title'          => __( 'Testimonials', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'testimonials', 'review' ),
				'categories'     => array( 'testimonials' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/43-testimonials-six/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/43-testimonials-six/screenshot.png',
			),
			array(
				'title'          => __( 'Call to Action', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'call-to-action', 'separator' ),
				'categories'     => array( 'call-to-action' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/44-cta-one/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/44-cta-one/screenshot.png',
			),
			array(
				'title'          => __( 'Call to Action', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'call-to-action', 'separator' ),
				'categories'     => array( 'call-to-action' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/45-cta-two/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/45-cta-two/screenshot.png',
			),
			array(
				'title'          => __( 'Call to Action', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'call-to-action', 'separator' ),
				'categories'     => array( 'call-to-action' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/46-cta-three/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/46-cta-three/screenshot.png',
			),
			array(
				'title'          => __( 'Call to Action', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'call-to-action', 'separator' ),
				'categories'     => array( 'call-to-action' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/47-cta-four/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/47-cta-four/screenshot.png',
			),
			array(
				'title'          => __( 'Footer', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'footer' ),
				'categories'     => array( 'footer' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/48-footer-one/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/48-footer-one/screenshot.png',
			),
			array(
				'title'          => __( 'Footer', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'footer' ),
				'categories'     => array( 'footer' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/49-footer-two/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/49-footer-two/screenshot.png',
			),
			array(
				'title'          => __( 'Footer', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'footer' ),
				'categories'     => array( 'footer' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/50-footer-three/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/50-footer-three/screenshot.png',
			),
			array(
				'title'          => __( 'Footer', 'otter-blocks' ),
				'type'           => 'block',
				'author'         => __( 'Otter', 'otter-blocks' ),
				'keywords'       => array( 'footer' ),
				'categories'     => array( 'footer' ),
				'template_url'   => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/51-footer-four/template.json',
				'screenshot_url' => 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/templates/51-footer-four/screenshot.png',
			),
		);

		$templates = apply_filters( 'themeisle_gutenberg_templates', $templates_list );

		return rest_ensure_response( $templates );
	}

	/**
	 * Function to fetch template JSON.
	 *
	 * @param \WP_REST_Request $request Rest request.
	 *
	 * @return array|bool|\WP_Error
	 */
	public function import_template( $request ) {
		global $wp_filesystem;

		if ( ! current_user_can( 'edit_posts' ) ) {
			return false;
		}

		require_once ABSPATH . '/wp-admin/includes/file.php';
		WP_Filesystem();

		$url      = $request->get_param( 'url' );
		$preview  = $request->get_param( 'preview' );
		$site_url = get_site_url();

		if ( strpos( $url, $site_url ) !== false ) {
			$url = str_replace( $site_url, ABSPATH, $url );

			if ( $wp_filesystem->exists( $url ) ) {
				$json = $wp_filesystem->get_contents( $url );
			} else {
				return new WP_Error( 'filesystem_error', __( 'File doesn\'t exist', 'otter-blocks' ) );
			}
		} else {
			if ( function_exists( 'vip_safe_wp_remote_get' ) ) {
				$request = vip_safe_wp_remote_get( $url );
			} else {
				$request = wp_remote_get( $url ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.wp_remote_get_wp_remote_get
			}

			$json = wp_remote_retrieve_body( $request );
		}

		$obj = json_decode( $json );

		if ( ! isset( $obj->__file ) || 'wp_export' !== $obj->__file || ! isset( $obj->content ) || $preview ) {
			return rest_ensure_response( $obj );
		}

		$regex = '/https?:\/\/\S+(?:png|jpg|jpeg|gif|webp)/';
		preg_match_all( $regex, $obj->content, $images, PREG_SET_ORDER, 0 );

		if ( count( $images ) >= 1 ) {
			foreach ( $images as $image ) {
				$image = $image[0];

				$value = $this->import_image( $image );

				if ( $value ) {
					$obj->content = str_replace( $image, $value, $obj->content );
				}
			}
		}

		return rest_ensure_response( $obj );
	}

	/**
	 * Get image from Media Library by hash
	 *
	 * @param string $url Image URL.
	 *
	 * @return string
	 */
	public function get_saved_image( $url ) {
		global $wpdb;

		$post_id = $wpdb->get_var( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->prepare(
				'SELECT `post_id` FROM `' . $wpdb->postmeta . '` WHERE `meta_key` = \'_themeisle_blocks_image_hash\' AND `meta_value` = %s LIMIT 1;',
				sha1( $url )
			)
		);

		if ( $post_id ) {
			return $post_id;
		}

		return false;
	}

	/**
	 * Upload image to Media Library
	 *
	 * @param string $url Image URL.
	 *
	 * @return string
	 */
	public function import_image( $url ) {
		$saved_image = $this->get_saved_image( $url );

		if ( $saved_image ) {
			return wp_get_attachment_url( $saved_image );
		}

		if ( ! function_exists( 'media_handle_sideload' ) ) {
			require_once ABSPATH . '/wp-admin/includes/file.php';
			require_once ABSPATH . 'wp-admin/includes/image.php';
			require_once ABSPATH . 'wp-admin/includes/media.php';
		}

		$tmp = download_url( $url );

		$file_array = array(
			'name'     => basename( $url ),
			'tmp_name' => $tmp,
		);

		if ( is_wp_error( $tmp ) ) {
			wp_delete_file( $file_array['tmp_name'] );
			return $tmp;
		}

		$id = media_handle_sideload( $file_array );

		if ( is_wp_error( $id ) ) {
			wp_delete_file( $file_array['tmp_name'] );
			return $id;
		}

		update_post_meta( $id, '_themeisle_blocks_image_hash', sha1( $url ) );

		$value = wp_get_attachment_url( $id );

		return $value;
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.0.0
	 * @access public
	 * @return Template_Library_Server
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
