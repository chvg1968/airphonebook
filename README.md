# Airphonebook

## Overview
Airphonebook is a web application designed to manage and display contact information using a structured and interactive interface. The application fetches data from Airtable and organizes it into sections and categories for easy navigation.

## Project Structure

```
/airphonebook
│
├── .env
├── HomePage.html
├── index.html
├── index.js
├── package-lock.json
├── package.json
├── script.js
├── styles.css
├── assets/
├── src/
│   ├── html/
│   │   └── pages/
│   │       ├── villaclara.html
│   │       └── [other HTML files]
│   └── js/
│       ├── Api.js
│       ├── Constants.js
│       └── Tree.js
```

### Key Directories and Files
- **HomePage.html, index.html**: Main entry points for the application.
- **src/html/pages/**: Contains additional HTML pages.
- **src/js/**: Contains JavaScript modules for API interaction, constants, and tree rendering.
- **assets/**: Stores images, fonts, and other static assets.
- **styles.css**: Contains global styles for the application.

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   ```

2. **Navigate to the project directory**:
   ```bash
   cd airphonebook
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Configure environment variables**:
   - Create a `.env` file in the root directory.
   - Add your Airtable API credentials:
     ```
     AIRTABLE_BASE_ID=your_base_id
     AIRTABLE_API_KEY=your_api_key
     ```

5. **Run the application**:
   - Use a local server to serve the HTML files, such as Live Server in VSCode or a simple HTTP server.

## Usage
- Open `index.html` in your browser to start the application.
- Navigate through sections and categories to view contact details.

## Contributing
Feel free to submit issues or pull requests. Contributions are welcome!

## License
This project is licensed under the MIT License.
