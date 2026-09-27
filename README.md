# Circularity Twin

Industrial waste reuse decision platform — turning waste streams into circular-economy pathways.

## Problem Statement

ENR-04: Industrial Waste Reuse & Circular-Economy Optimization

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Run Tests

```bash
cd backend
pytest app/tests/ -v
```

## Architecture

See [docs/architecture.md](docs/architecture.md) for how the pieces connect and what's real vs. mocked.

## License

MIT
