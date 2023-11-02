<?php
/**
 * PHPUnit bootstrap file
 *
 * @package Test_Travis
 */

namespace ThemeIsle\GutenbergBlocks\Tests;

use Stripe\HttpClient\ClientInterface;

class StripeHttpClientMock implements ClientInterface
{
	public function request($method, $absUrl, $headers, $params, $hasFile)
	{
		$urlParts = parse_url($absUrl);
		$path = $urlParts['path'];

		if ($path === '/v1/products') {
			return array($this->mockProductsList(), 200, null);
		}

		if (preg_match('#^/v1/products/\w+$#', $path)) {
			return array($this->mockSingleProduct(), 200, null);
		}

		if ($path === '/v1/prices') {
			return array($this->mockPricesList(), 200, null);
		}

		if (preg_match('#^/v1/prices/\w+$#', $path)) {
			return array($this->mockSinglePrice($path), 200, null);
		}

		if ($path === '/v1/checkout/sessions') {
			return array($this->mockCreateSession(), 200, null);
		}

		if (preg_match('#^/v1/checkout/sessions/\w+/line_items$#', $path)) {
			return array($this->mockSessionItems($path), 200, null);
		}

		if (preg_match('#^/v1/checkout/sessions/\w+$#', $path)) {
			return array($this->mockGetSession($path), 200, null);
		}

		if (preg_match('#^/v1/subscriptions/\w+$#', $path)) {
			return array($this->mockGetSubscription($path), 200, null);
		}

		return [
			$this->mockProductsList(),
			'200',
			null
		];
	}

	private function mockProductsList()
	{
		return json_encode(
			[
				'object' => 'list',
				'data' => [
					[
						'id' => 'prod_1',
						'name' => 'Laptop',
						'description' => 'High-performance laptop',
						'price' => 1200,
						'currency' => 'USD',
						'active' => true
					],
					[
						'id' => 'prod_2',
						'name' => 'Smartphone',
						'description' => 'Latest model smartphone',
						'price' => 800,
						'currency' => 'USD',
						'active' => true
					],
					[
						'id' => 'prod_3',
						'name' => 'Headphones',
						'description' => 'Noise-cancelling headphones',
						'price' => 300,
						'currency' => 'USD',
						'active' => false
					]
				],
				'has_more' => false
			]
		);
	}

	private function mockSingleProduct()
	{
		return json_encode(
			[
				'id' => 'prod_1',
				'name' => 'Laptop',
				'description' => 'High-performance laptop',
				'price' => 1200,
				'currency' => 'USD',
				'active' => true,
				'object' => 'product'
			]
		);
	}

	private function mockPricesList()
	{
		return json_encode(
			[
				'object' => 'list',
				'data' => [
					[
						'id' => 'price_1',
						'product' => 'prod_1',
						'unit_amount' => 1000
					],
					[
						'id' => 'price_2',
						'product' => 'prod_2',
						'unit_amount' => 2000
					]
				]
			]
		);
	}

	private function mockSinglePrice()
	{
		return json_encode(
			[
				'id' => 'price_1',
				'product' => 'prod_1',
				'unit_amount' => 1000,
				'currency' => 'USD',
				'object' => 'price',
				'active' => true,
				'billing_scheme' => 'per_unit',
			]
		);
	}

	private function mockCreateSession()
	{
		return json_encode(
			[
				'object' => 'object',
				'data'   => [
					'id' => 'sess_1',
					'status' => 'created'
				]
			]
		);
	}

	private function mockGetSession()
	{
		return json_encode(
			[
				'id' => 'sess_1',
				'status' => 'complete',
				'customer' => 'cus_1',
				'customer_details' => [
					'email' => 'test@test.com'
				],
				'mode' => 'payment',
				'payment_status' => 'paid',
				'payment_intent' => 'pi_1',
				'object' => 'checkout.session',
				'success_url' => 'https://example.com/success?product_id=prod_1',
				'complete' => true
			]
		);
	}

	private function mockSessionItems()
	{
		return json_encode(
			[
				'object' => 'list',
				'data' => [
					[
						'id' => 'item_1',
						'quantity' => 1,
						'object' => 'item',
						'price' => [
							'id' => 'price_1',
							'product' => 'prod_1',
							'unit_amount' => 1000,
							'currency' => 'USD',
							'object' => 'price',
							'active' => true,
							'billing_scheme' => 'per_unit',
						]
					],
					[
						'id' => 'item_2',
						'quantity' => 2,
						'object' => 'item',
						'price' => [
							'id' => 'price_1',
							'product' => 'prod_1',
							'unit_amount' => 1000,
							'currency' => 'USD',
							'object' => 'price',
							'active' => true,
							'billing_scheme' => 'per_unit',
						]
					]
				]
			]
		);
	}

	private function mockGetSubscription()
	{
		return json_encode(array(
			'id' => 'sub_1',
			'status' => 'active'
		));
	}
}

