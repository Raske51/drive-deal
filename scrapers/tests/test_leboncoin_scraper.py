import unittest
from unittest.mock import patch, MagicMock
from scrapers.leboncoin_scraper import LeBonCoinScraper
from datetime import datetime

class TestLeBonCoinScraper(unittest.TestCase):
    def setUp(self):
        self.scraper = LeBonCoinScraper()
        self.mock_search_html = """
        <html>
            <body>
                <div class="styles_adCard">
                    <a href="/voitures/2090517522.htm">
                        <div class="styles_adTitle">BMW Serie 3 320d</div>
                        <div class="styles_price">25000 €</div>
                        <div class="styles_specs">
                            <span>2020</span>
                            <span>30000 km</span>
                            <span>Diesel</span>
                        </div>
                    </a>
                </div>
                <div class="styles_adCard">
                    <a href="/voitures/2090517523.htm">
                        <div class="styles_adTitle">Audi A4 TDI</div>
                        <div class="styles_price">28000 €</div>
                        <div class="styles_specs">
                            <span>2021</span>
                            <span>20000 km</span>
                            <span>Diesel</span>
                        </div>
                    </a>
                </div>
            </body>
        </html>
        """
        
        self.mock_detail_html = """
        <html>
            <body>
                <h1>BMW Serie 3 320d</h1>
                <div class="styles_price">25000 €</div>
                <div class="styles_specs">
                    <div>Année: 2020</div>
                    <div>Kilométrage: 30000 km</div>
                    <div>Carburant: Diesel</div>
                    <div>Boîte de vitesse: Automatique</div>
                    <div>Couleur: Noir</div>
                </div>
                <div class="styles_description">
                    Très belle BMW Serie 3 320d en excellent état.
                    Entretien complet BMW, carnet à jour.
                    Options: GPS, Cuir, Toit ouvrant, etc.
                </div>
                <div class="styles_location">Paris 75008</div>
            </body>
        </html>
        """

    @patch('scrapers.base_scraper.BaseScraper.fetch_page')
    def test_scrape_search_page(self, mock_fetch):
        # Setup
        mock_fetch.return_value = self.mock_search_html
        
        # Execute
        results = self.scraper.scrape_search_page('https://www.leboncoin.fr/voitures/offres')
        
        # Assert
        self.assertEqual(len(results), 2)
        self.assertEqual(results[0]['title'], 'BMW Serie 3 320d')
        self.assertEqual(results[0]['price'], 25000)
        self.assertEqual(results[0]['year'], 2020)
        self.assertEqual(results[0]['mileage'], 30000)
        self.assertEqual(results[0]['fuel_type'], 'Diesel')
        self.assertTrue(results[0]['url'].endswith('/voitures/2090517522.htm'))

    @patch('scrapers.base_scraper.BaseScraper.fetch_page')
    def test_scrape_detail_page(self, mock_fetch):
        # Setup
        mock_fetch.return_value = self.mock_detail_html
        url = 'https://www.leboncoin.fr/voitures/2090517522.htm'
        
        # Execute
        result = self.scraper.scrape_listing(url)
        
        # Assert
        self.assertEqual(result['title'], 'BMW Serie 3 320d')
        self.assertEqual(result['price'], 25000)
        self.assertEqual(result['year'], 2020)
        self.assertEqual(result['mileage'], 30000)
        self.assertEqual(result['fuel_type'], 'Diesel')
        self.assertEqual(result['transmission'], 'Automatique')
        self.assertEqual(result['color'], 'Noir')
        self.assertEqual(result['location'], 'Paris 75008')
        self.assertIn('description', result)
        self.assertTrue(result['description'].startswith('Très belle BMW'))
        self.assertEqual(result['source_url'], url)
        self.assertIn('scraped_at', result)

    @patch('scrapers.base_scraper.BaseScraper.fetch_page')
    def test_scrape_with_missing_data(self, mock_fetch):
        # Setup
        mock_fetch.return_value = """
        <html>
            <body>
                <h1>BMW Serie 3 320d</h1>
                <div class="styles_price">Prix sur demande</div>
                <div class="styles_specs">
                    <div>Année: 2020</div>
                    <div>Carburant: Diesel</div>
                </div>
            </body>
        </html>
        """
        
        # Execute
        result = self.scraper.scrape_listing('https://www.leboncoin.fr/voitures/2090517522.htm')
        
        # Assert
        self.assertEqual(result['title'], 'BMW Serie 3 320d')
        self.assertIsNone(result['price'])
        self.assertEqual(result['year'], 2020)
        self.assertEqual(result['fuel_type'], 'Diesel')
        self.assertIsNone(result.get('mileage'))
        self.assertIsNone(result.get('transmission'))
        self.assertIsNone(result.get('color'))

    @patch('scrapers.base_scraper.BaseScraper.fetch_page')
    def test_pagination(self, mock_fetch):
        # Setup
        mock_fetch.return_value = self.mock_search_html + """
        <div class="pagination">
            <a href="?page=1" class="selected">1</a>
            <a href="?page=2">2</a>
            <a href="?page=3">3</a>
        </div>
        """
        
        # Execute
        has_next, next_url = self.scraper.has_next_page(
            'https://www.leboncoin.fr/voitures/offres'
        )
        
        # Assert
        self.assertTrue(has_next)
        self.assertEqual(next_url, 'https://www.leboncoin.fr/voitures/offres?page=2')

    @patch('scrapers.base_scraper.BaseScraper.fetch_page')
    def test_no_next_page(self, mock_fetch):
        # Setup
        mock_fetch.return_value = self.mock_search_html + """
        <div class="pagination">
            <a href="?page=1">1</a>
            <a href="?page=2" class="selected">2</a>
        </div>
        """
        
        # Execute
        has_next, next_url = self.scraper.has_next_page(
            'https://www.leboncoin.fr/voitures/offres?page=2'
        )
        
        # Assert
        self.assertFalse(has_next)
        self.assertIsNone(next_url)

if __name__ == '__main__':
    unittest.main() 