import os
import shutil
import requests
from serpapi import GoogleSearch
from dotenv import load_dotenv
import time
from env_var import SERP_API_KEY
# Load environment variables
# Get the project root directory (one level up from scripts/)
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(project_root, ".env")

# Configuration
BASE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")

CATEGORIES = {
    # "Zöldségek": [
    #     "Répa", "Krumpli", "Paradicsom", "Paprika", "Uborka", 
    #     "Hagyma", "Saláta", "Brokkoli", "Karfiol", "Kukorica", 
    #     "Borsó", "Bab", "Retek", "Cékla", "Tök", 
    #     "Padlizsán", "Cukkini", "Spenót", "Zeller", "Spárga", 
    #     "Articsóka", "Édesburgonya"
    # ],
    # "Gyümölcsök": [
    #     "Alma", "Banán", "Narancs", "Citrom", "Eper", 
    #     "Szőlő", "Körte", "Barack", "Dinnye", "Cseresznye", 
    #     "Szilva", "Málna", "Ananász", "Kivi", "Áfonya", 
    #     "Mandarin", "Grapefruit", "Mangó", "Papaya", "Gránátalma", 
    #     "Füge", "Datolya"
    # ],
    # "Magyar irodalom nagy alakjai": [
    #     "Petőfi Sándor", "Arany János", "Ady Endre", "József Attila", "Radnóti Miklós", 
    #     "Kosztolányi Dezső", "Babits Mihály", "Móricz Zsigmond", "Mikszáth Kálmán", "Jókai Mór", 
    #     "Karinthy Frigyes", "Csokonai Vitéz Mihály", "Kölcsey Ferenc", "Vörösmarty Mihály", "Örkény István", 
    #     "Pilinszky János", "Weöres Sándor", "Szabó Magda", "Márai Sándor", "Krúdy Gyula", 
    #     "Tóth Árpád"
    # ],
    # "Zászlók": [
    #     "Madagaszkár", "Amerikai Egyesült Államok", "Egyesült Királyság", "Németország", "Franciaország", 
    #     "Olaszország", "Japán", "Kína", "Kanada", "Brazília", 
    #     "Spanyolország", "Oroszország", "Görögország", "Törökország", "Ausztrália", 
    #     "Svédország", "Argentína ", "Dél-Korea", "India", "Dél-Afrika", 
    #     "Mexikó", "Egyiptom"
    # ],
    # "Amerikai elnökök": [
    #     "Donald Trump", "Joe Biden", "Barack Obama", "George W. Bush", "Bill Clinton", 
    #     "Abraham Lincoln", "George Washington", "John F. Kennedy", "Ronald Reagan", "Franklin D. Roosevelt", 
    #     "Thomas Jefferson", "Theodore Roosevelt", "Richard Nixon", "Jimmy Carter", "Dwight D. Eisenhower", 
    #     "Harry S. Truman", "Woodrow Wilson", "Andrew Jackson", "Ulysses S. Grant", "Lyndon B. Johnson"
    # ],
    # "Naruto karakterek": [
    #     "Naruto Uzumaki", "Sasuke Uchiha", "Sakura Haruno", "Kakashi Hatake", "Gaara", 
    #     "Itachi Uchiha", "Hinata Hyuga", "Shikamaru Nara", "Rock Lee", "Tsunade", 
    #     "Jiraiya", "Orochimaru", "Minato Namikaze", "Madara Uchiha", "Obito Uchiha", 
    #     "Neji Hyuga", "Kiba Inuzuka", "Ino Yamanaka", "Choji Akimichi", "Might Guy", 
    #     "Pain Nagato"
    # ],
    "Kresz táblák": [
        "Stop tábla", "Elsőbbségadás kötelező", "Körforgalom", "Behajtani tilos", 
        "Megállni tilos", "Sebességkorlátozás", "Parkolni tilos", "Egyirányú út", 
        "Elsőbbségadás kötelező tábla", "Veszélyes kanyar", "Gyalogos átkelőhely", 
        "Gyermekek", "Vasúti átjáró", "Munkavégzés", "Lámpás jelzőberendezés"
    ],
    "Gyorséttermi láncok": [
        "McDonald's", "Burger King", "KFC", "Subway", "Pizza Hut", 
        "Domino's Pizza", "Taco Bell", "Starbucks", "Dunkin' Donuts", "Wendy's", 
        "Papa John's", "Little Caesars", "Chipotle", "Five Guys", "Dairy Queen"
    ],
    "Festmények": [
        "A csillagos éj", "A Mona Lisa", "A sírásó", "Guernica", "A vízililiomok", 
        "A születés", "Arany Madonna", "A szabadság vezeti a népet", "A csodálatos mandula", 
        "A kálvária", "A vén gitáros", "A reggel", "A nappal", "A szürke fa", "A sárga Krisztus"
    ],
    "Feltalálók": [
        "Thomas Edison", "Nikola Tesla", "Alexander Graham Bell", "Leonardo da Vinci", "Marie Curie", 
        "Albert Einstein", "Isaac Newton", "Galileo Galilei", "Charles Darwin", "Louis Pasteur", 
        "James Watt", "Henry Ford", "Wright testvérek", "Guglielmo Marconi", "Tim Berners-Lee"
    ],
    "Épületek a világ körül": [
        "Eiffel-torony", "Big Ben", "Szabadság-szobor", "Tádzs Mahal", "Operaház Sydney", 
        "Colosseum", "Párthénon", "Sagrada Família", "Neuschwanstein kastély", "Petra", 
        "Chichen Itza", "Machu Picchu", "Angkor Wat", "Burj Khalifa", "Empire State Building"
    ]
}

def download_image(query, folder, filename):
    try:
        print(f"Searching for: {query}...")
        
        # Get API key from environment
        api_key = SERP_API_KEY
        if not api_key:
            print("Error: SERP_API_KEY not found. Make sure it's in your .env file.")
            return False
        
        # Search for images using SerpAPI
        params = {
            "engine": "google_images",
            "q": query,
            "api_key": api_key,
        }
        
        search = GoogleSearch(params)
        results = search.get_dict()
        
        if "error" in results:
            print(f"SerpApi Error: {results['error']}")
            return False
        
        image_results = results.get("images_results", [])
        if not image_results:
            print(f"No results for {query}")
            return False
        
        # Get the first image's original URL
        image_url = image_results[0].get('original')
        if not image_url:
            print(f"No image URL found for {query}")
            return False
        
        print(f"Found image URL: {image_url}")
        
        # Download with user-agent to avoid basic blocks
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        print(f"Downloading {image_url}...")
    
        # Increased timeout to 15 seconds
        response = requests.get(image_url, headers=headers, timeout=15)
        print(f"Response: {response.status_code}")
        if response.status_code == 200:
            file_path = os.path.join(folder, filename)
            with open(file_path, 'wb') as f:
                f.write(response.content)
            print(f"Saved: {filename}")
            return True
        else:
            print(f"Failed to download {query} (Status: {response.status_code})")
            return False
            
    except Exception as e:
        print(f"Error downloading {query}: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():

    for category, items in CATEGORIES.items():
        print(f"\nProcessing Category: {category}")
        cat_dir = os.path.join(BASE_DIR, category)
        os.makedirs(cat_dir)
        
        for i, item in enumerate(items):
            # Format: 01_Name.jpg
            prefix = f"{i+1:02d}"
            
            # Clean item name for filename
            display_name = item.replace(" ", "")
            
            filename = f"{prefix}_{display_name}.jpg"
            
            # Retry logic
            success = False
            attempts = 0
            while not success and attempts < 3:
                success = download_image(item, cat_dir, filename)
                if not success:
                    print(f"Retry {attempts + 1} for {item}...")
                    time.sleep(2) # Wait before retry
                    attempts += 1
            
            # Sleep briefly to be polite to API
            time.sleep(1)

if __name__ == "__main__":
    main()
