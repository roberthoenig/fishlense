# Submission for the VAST 2023 Mini-Challenge 1

## Demo

Visit http://52.215.84.45:1234/ for a live demo.

_Caveat: The demo takes a couple seconds to load. Also, it does not show the overview graph because I was unable to remotely host Neo4j. However, the overview panel is of minor importance and is not needed for interactive graph exploration with FishLense._

## Team Members
* Robert Hönig
* Jiale Chen

## Requirements

Install all Python dependencies with
```
python install -r requirements.txt
cd backend-project
pip install -e .
```

Install all Node.js dependencies by running
```
cd frontend-project
npm install
```

## Deployment

### Frontend
```
cd frontend-project
npm start
```

### Backend

1. Start a Neo4j server with an empty database, user `root` and password `password`
2. 
    ```
    python graph-vis/neo4j_gen.py
    ```
3.
    ```
    start-server
    ```
