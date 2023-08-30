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
			return array($this->mockProductsList(), 200);
		}

		if (preg_match('#^/v1/products/\w+$#', $path)) {
			return array($this->mockSingleProduct($path), 200);
		}

		if ($path === '/v1/prices') {
			return array($this->mockPricesList(), 200);
		}

		if (preg_match('#^/v1/prices/\w+$#', $path)) {
			return array($this->mockSinglePrice($path), 200);
		}

		if ($path === '/v1/checkout/sessions') {
			return array($this->mockCreateSession(), 200);
		}

		if (preg_match('#^/v1/checkout/sessions/\w+$#', $path)) {
			return array($this->mockGetSession($path), 200);
		}

		if (preg_match('#^/v1/checkout/sessions/\w+/line_items$#', $path)) {
			return array($this->mockSessionItems($path), 200);
		}

		if (preg_match('#^/v1/subscriptions/\w+$#', $path)) {
			return array($this->mockGetSubscription($path), 200);
		}

		return array(json_encode(array('error' => 'Unknown URL')), 404);
	}

	private function mockProductsList()
	{
		return json_encode(array(
			'data' => array(
				array(
					'id' => 'prod_1',
					'name' => 'Product 1'
				) ,
				array(
					'id' => 'prod_2',
					'name' => 'Product 2'
				)
			)
		));
	}

	private function mockSingleProduct()
	{
		return json_encode(array(
			'id' => 'prod_1',
			'name' => 'Product 1'
		));
	}

	private function mockPricesList()
	{
		return json_encode(array(
			'data' => array(
				array(
					'id' => 'price_1',
					'product' => 'prod_1',
					'unit_amount' => 1000
				) ,
				array(
					'id' => 'price_2',
					'product' => 'prod_2',
					'unit_amount' => 2000
				)
			)
		));
	}

	private function mockSinglePrice()
	{
		return json_encode(array(
			'id' => 'price_1',
			'product' => 'prod_1',
			'unit_amount' => 1000
		));
	}

	private function mockCreateSession()
	{
		return json_encode(array(
			'id' => 'sess_1',
			'status' => 'created'
		));
	}

	private function mockGetSession()
	{
		return json_encode(array(
			'id' => 'sess_1',
			'status' => 'created'
		));
	}

	private function mockSessionItems()
	{
		return json_encode(array(
			'data' => array(
				array(
					'id' => 'item_1',
					'price' => 'price_1',
					'quantity' => 1
				) ,
				array(
					'id' => 'item_2',
					'price' => 'price_2',
					'quantity' => 2
				)
			)
		));
	}

	private function mockGetSubscription()
	{
		return json_encode(array(
			'id' => 'sub_1',
			'status' => 'active'
		));
	}
}

