import unittest
from unittest.mock import patch, MagicMock
import json
from scrapers.base_scraper import BaseScraper
from datetime import datetime

class MockResponse:
    def __init__(self, text, status_code=200):
        self.text = text
        self.status_code = status_code

class TestBaseScraper(unittest.TestCase):
    def setUp(self):
        self.scraper = BaseScraper()
        self.mock_html = """
        <html>
            <body>
                <div class="car-listing">
                    <h2>BMW Serie 3</h2>
                    <div class="price">25000 €</div>
                    <div class="details">
                        <span class="year">2020</span>
                        <span class="mileage">30000 km</span>
                        <span class="fuel">Diesel</span>
                    </div>
                </div>
            </body>
        </html>
        """

    @patch('requests.get')
    def test_fetch_page(self, mock_get):
        # Setup
        mock_get.return_value = MockResponse(self.mock_html)
        
        # Execute
        result = self.scraper.fetch_page('http://test-url.com')
        
        # Assert
        self.assertEqual(result, self.mock_html)
        mock_get.assert_called_once_with(
            'http://test-url.com',
            headers=self.scraper.headers,
            timeout=30
        )

    @patch('requests.get')
    def test_fetch_page_with_retry(self, mock_get):
        # Setup
        mock_get.side_effect = [
            Exception("Connection error"),
            MockResponse(self.mock_html)
        ]
        
        # Execute
        result = self.scraper.fetch_page('http://test-url.com')
        
        # Assert
        self.assertEqual(result, self.mock_html)
        self.assertEqual(mock_get.call_count, 2)

    @patch('requests.get')
    def test_fetch_page_max_retries_exceeded(self, mock_get):
        # Setup
        mock_get.side_effect = Exception("Connection error")
        
        # Execute & Assert
        with self.assertRaises(Exception):
            self.scraper.fetch_page('http://test-url.com')
        
        self.assertEqual(mock_get.call_count, 3)  # Default max retries

    def test_clean_price(self):
        test_cases = [
            ('25 000 €', 25000),
            ('25.000 €', 25000),
            ('25,000 €', 25000),
            ('25000€', 25000),
            ('25k €', 25000),
            ('Prix sur demande', None),
        ]
        
        for input_price, expected in test_cases:
            with self.subTest(input_price=input_price):
                result = self.scraper.clean_price(input_price)
                self.assertEqual(result, expected)

    def test_clean_mileage(self):
        test_cases = [
            ('30 000 km', 30000),
            ('30.000 km', 30000),
            ('30,000 km', 30000),
            ('30000km', 30000),
            ('30k km', 30000),
            ('Neuf', 0),
        ]
        
        for input_mileage, expected in test_cases:
            with self.subTest(input_mileage=input_mileage):
                result = self.scraper.clean_mileage(input_mileage)
                self.assertEqual(result, expected)

    def test_clean_year(self):
        test_cases = [
            ('2020', 2020),
            ('01/2020', 2020),
            ('2020/01', 2020),
            ('Année 2020', 2020),
        ]
        
        for input_year, expected in test_cases:
            with self.subTest(input_year=input_year):
                result = self.scraper.clean_year(input_year)
                self.assertEqual(result, expected)

    @patch('scrapers.base_scraper.BaseScraper.fetch_page')
    def test_scrape_listing(self, mock_fetch):
        # Setup
        mock_fetch.return_value = self.mock_html
        expected_car = {
            'title': 'BMW Serie 3',
            'price': 25000,
            'year': 2020,
            'mileage': 30000,
            'fuel_type': 'Diesel',
            'source_url': 'http://test-url.com',
            'scraped_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        # Execute
        result = self.scraper.scrape_listing('http://test-url.com')
        
        # Assert
        self.assertEqual(result['title'], expected_car['title'])
        self.assertEqual(result['price'], expected_car['price'])
        self.assertEqual(result['year'], expected_car['year'])
        self.assertEqual(result['mileage'], expected_car['mileage'])
        self.assertEqual(result['fuel_type'], expected_car['fuel_type'])
        self.assertEqual(result['source_url'], expected_car['source_url'])
        self.assertIn('scraped_at', result)

    def test_normalize_fuel_type(self):
        test_cases = [
            ('Diesel', 'Diesel'),
            ('DIESEL', 'Diesel'),
            ('Essence', 'Essence'),
            ('ESSENCE', 'Essence'),
            ('Hybride', 'Hybride'),
            ('Électrique', 'Électrique'),
            ('Electric', 'Électrique'),
            ('Unknown', 'Autre'),
        ]
        
        for input_fuel, expected in test_cases:
            with self.subTest(input_fuel=input_fuel):
                result = self.scraper.normalize_fuel_type(input_fuel)
                self.assertEqual(result, expected)

if __name__ == '__main__':
    unittest.main() 