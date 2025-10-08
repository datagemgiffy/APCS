–sourced and Gemini AI–generated questions.

## Contents
- `index.html` → Main site layout and UI
- `style.css` → Custom earthy/minimal Tailwind-based theme
- `script.js` → Question logic, answer checking, Gemini API integration
- `questions.json` → Starter local question bank (add more here)
- `README.md` → Setup and usage instructions


1. **Open `index.html` in your browser**:
   - Just double-click `index.html` to view locally, or
   - Serve with a local web server (recommended):
     ```bash
     python3 -m http.server
     ```
     Then go to [http://localhost:8000](http://localhost:8000).

2. **Adding more College Board questions**:
   - Edit `questions.json` and append new objects with the following structure:
     ```json
     {
       "id": 101,
       "language": "Java",
       "type": "mc",
       "prompt": "What is the output of ...?",
       "code": "System.out.println(2+3);",
       "options": ["23", "5", "Error"],
       "answer": "5",
       "explanation": "Java evaluates integers arithmetically."
     }
     ```

3. **Gemini API**:
   - Your API key is already embedded in `script.js`.
   - The site will occasionally (20% of the time) fetch a new AI-generated AP CS question.

4. **Credits**:
   - All AP® Computer Science questions are © College Board.
   - This site is not endorsed by College Board.
   - Additional questions may be AI-generated.

---
Enjoy practicing! 🚀
