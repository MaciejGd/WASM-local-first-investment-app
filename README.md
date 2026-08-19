# Investment Portfolio Tracking & Forecasting Application

## Overview

This project is a web application for **tracking an investment portfolio
and forecasting investment outcomes**. The application combines a
React-based frontend, a Flask backend, local browser storage using
IndexedDB, and a WebAssembly (WASM) module written in C++ for
computationally intensive financial simulations.

The forecasting component uses **Monte Carlo simulations** implemented
in C++ and compiled to WebAssembly. This allows financial calculations
to be executed directly in the browser while keeping computationally
intensive operations separate from the main React application.

The application is containerized with Docker and can be started using a
single `docker compose up` command. The same command also builds and
serves the frontend, starts the backend services, and runs the
end-to-end Playwright test suite.

## Screenshots

### Investment portfolio

<img width="1902" height="904" alt="image" src="https://github.com/user-attachments/assets/3e95f9dc-e2ae-4d8f-b19b-f485897c5cce" />


### Investment risk analysis

<img width="1886" height="909" alt="image" src="https://github.com/user-attachments/assets/1cd5d4e6-c23a-413c-8243-aa254be5c864" />

<img width="1890" height="903" alt="image" src="https://github.com/user-attachments/assets/8b73a227-3fe5-4fd9-a06f-693adb199117" />

<img width="1895" height="899" alt="image" src="https://github.com/user-attachments/assets/574b0037-c59d-4523-8375-23cb899f67d7" />


### Financial data graphs

<img width="1901" height="904" alt="image" src="https://github.com/user-attachments/assets/6d348079-a4ef-4ff3-b473-8dd84005afb3" />


## Main Features

-   Investment portfolio tracking.
-   Financial data management.
-   Investment forecasting using Monte Carlo simulations.
-   Portfolio optimization and analysis, including:
    -   Value at Risk (VaR).
    -   Upside and downside analysis.
    -   Portfolio optimization calculations.
-   C++ financial computation compiled to WebAssembly.
-   React frontend.
-   Web Workers for running synchronization and WASM simulations without
    blocking the main UI thread.
-   Persistent client-side storage using IndexedDB through Dexie.js.
-   Flask backend API.
-   SQLite database for application data.
-   MongoDB for financial data.
-   End-to-end testing with Playwright.
-   Docker-based development and deployment environment.
-   Nginx reverse proxy providing a unified entry point for the frontend
    and backend.

## Project Structure

``` text
├── Dockerfile
├── Makefile
├── compose.yml
├── backend/
├── e2e/
├── front-end/
├── nginx/
└── wasm/
```

### `backend/`

Contains the backend application implemented using **Flask**.

The backend is responsible for providing the API and handling
server-side application logic. It uses two databases for different
purposes:

-   **SQLite** --- the main application database.
-   **MongoDB** --- storage for financial data.

### `front-end/`

Contains the **React** frontend application.

The frontend is responsible for the user interface and client-side
application logic. It uses several technologies to handle data and
computational workloads:

-   **React** for building the user interface.
-   **Web Workers** for executing background tasks without blocking the
    browser's main thread.
-   **WebAssembly** for running the C++ financial simulation module.
-   **IndexedDB**, accessed through **Dexie.js**, for persistent
    client-side data storage and synchronization.

Web Workers are particularly useful for the WASM simulations because
Monte Carlo calculations can require significant computational
resources. Running these operations in a worker prevents long-running
calculations from blocking the React UI.

### `wasm/`

Contains the **C++ WebAssembly module** used for financial calculations.

The module contains the implementation of Monte Carlo simulations and
other computational functionality related to financial analysis,
including portfolio optimization and the analysis of potential upside
and downside outcomes and Value at Risk (VaR).

The directory also contains the generated WebAssembly binary and unit
tests for the C++ implementation.

The general execution flow is:

``` text
React application
      │
      ▼
Web Worker
      │
      ▼
WebAssembly module
      │
      ▼
C++ financial calculations
      │
      ▼
Simulation / portfolio analysis results
```

Keeping these calculations in WebAssembly allows computationally
intensive C++ code to run in the browser with performance closer to
native execution than equivalent high-level JavaScript implementations.

### `nginx/`

Contains the **Nginx server configuration**.

Nginx is used as a reverse proxy between the client and the application
services. It provides a unified entry point through which the frontend
and backend can be accessed as if they were hosted at the same location.

Conceptually, the request flow is:

``` text
Client
  │
  ▼
Nginx
  ├──► React frontend
  │
  └──► Flask backend
```

This also simplifies communication between the frontend and backend and
avoids exposing the individual services directly to the client.

### `e2e/`

Contains the **end-to-end tests** implemented using **Playwright**.

The tests verify the application from the perspective of a real user,
including interactions between the frontend and backend. The tests are
executed against the application running in the Docker environment.

### `Dockerfile`

Contains the Docker image configuration required to build and run the
application environment.

### `compose.yml`

Defines the services required to run the application using Docker
Compose.

Starting the project with Docker Compose initializes the required
services, builds the frontend, starts the backend, configures the Nginx
reverse proxy, and runs the end-to-end test suite.

### `Makefile`

Contains helper commands for common development and build operations.

## Application Architecture

The application is divided into several cooperating layers:

``` text
                    ┌─────────────────────┐
                    │       Client        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       Nginx         │
                    │   Reverse Proxy     │
                    └───────┬─────┬───────┘
                            │     │
               ┌────────────┘     └────────────┐
               ▼                               ▼
      ┌─────────────────┐             ┌─────────────────┐
      │ React Frontend  │             │ Flask Backend   │
      └────────┬────────┘             └────────┬────────┘
               │                               │
       ┌───────┴────────┐                ┌─────┴─────┐
       │                │                │           │
       ▼                ▼                ▼           ▼
   IndexedDB         Web Worker       SQLite     MongoDB
   / Dexie.js            │
                         ▼
                    WebAssembly
                         │
                         ▼
                    C++ / Monte
                    Carlo Engine
```

## Data Storage

The project uses different storage technologies according to the type of
data and where it needs to be available.

### SQLite

SQLite is used as the **main backend database**. It stores
application-related data that needs to be persisted on the server.

### MongoDB

MongoDB is used for **financial data**. Its document-oriented data model
is suitable for storing financial datasets and other data that may have
a less rigid structure.

### IndexedDB and Dexie.js

The frontend uses **IndexedDB** for persistent storage in the user's
browser. IndexedDB allows the application to store larger and more
structured datasets locally than simpler browser storage mechanisms such
as `localStorage`.

**Dexie.js** provides a higher-level API over IndexedDB, making database
operations easier to implement and maintain. It is used by the React
frontend for local data storage and synchronization.

This architecture allows the application to retain relevant data locally
while also communicating with the backend when server-side data is
required.

## Web Workers and WebAssembly

The frontend uses **Web Workers** to perform background operations
independently from the browser's main JavaScript thread.

This is important for the application's financial simulations because
Monte Carlo calculations can involve a large number of iterations.
Performing these calculations directly on the main thread could make the
user interface unresponsive.

The application therefore uses the following approach:

1.  React initiates a financial simulation.
2.  The task is passed to a Web Worker.
3.  The Web Worker invokes the WebAssembly module.
4.  The WebAssembly module executes the C++ Monte Carlo calculations.
5.  The simulation results are returned to the Web Worker.
6.  The results are passed back to the React application.
7.  React updates the user interface with the results.

This separation allows computationally intensive calculations to run in
the background while maintaining a responsive user interface.

## Financial Simulation

The WebAssembly module contains C++ implementations of financial
calculations based on **Monte Carlo simulation**.

Monte Carlo methods can be used to generate a large number of possible
future outcomes based on input financial data and assumptions. The
resulting distribution of outcomes can then be used to analyze the
characteristics and potential risks of an investment portfolio.

The application uses these calculations for purposes such as:

-   portfolio optimization,
-   Value at Risk (VaR) analysis,
-   evaluation of potential upside,
-   evaluation of potential downside,
-   investment forecasting.

The use of C++ compiled to WebAssembly makes it possible to reuse
computationally intensive native code in the browser while avoiding the
need to send every simulation request to the backend.

## Testing

The project includes both unit-level testing of the WebAssembly/C++ component using custom testing framework.
Frontend has been unit tested with vitest, backend using pytest.
Also added end-to-end testing of the complete application, utilizing Playwright.

### End-to-End Tests

The `e2e/` directory contains Playwright tests that exercise the
application as a complete system.

The end-to-end tests run against the Dockerized application, allowing
the project to verify the interaction between the frontend, backend,
proxy, and other required services.

## Running the Application

The project is designed to be run using Docker Compose.

Start the complete application with:

``` bash
docker compose up
```

The Docker Compose environment handles the main application startup
process, including:

1.  Starting the required backend and supporting services.
2.  Building the React frontend.
3.  Serving the production frontend build.
4.  Starting the Flask backend.
5.  Starting the Nginx reverse proxy.
6.  Making the frontend and backend available through the unified Nginx
    entry point.
7.  Running the Playwright end-to-end test suite against the running
    application.

After the services have started, the application can be accessed through
the configured Nginx endpoint.

## Technology Stack

  Area                       Technology
  -------------------------- -------------------------
  Frontend                   React
  Client-side storage        IndexedDB
  IndexedDB abstraction      Dexie.js
  Financial computation      C++
  Browser execution of C++   WebAssembly
  Backend                    Flask
  Main database              SQLite
  Financial data             MongoDB
  Reverse proxy              Nginx
  End-to-end testing         Playwright
  Containerization           Docker / Docker Compose

## Design Goals

The architecture is designed around several main goals:

-   **Separation of concerns** --- the frontend, backend, financial
    computation, and infrastructure are separated into dedicated
    modules.
-   **Responsive user interface** --- computationally expensive
    simulations are moved to Web Workers and executed using WebAssembly.
-   **Client-side persistence** --- IndexedDB and Dexie.js provide
    persistent browser storage.
-   **Computational performance** --- performance-sensitive financial
    calculations are implemented in C++ and compiled to WebAssembly.
-   **Scalability of data storage** --- SQLite and MongoDB are used for
    different categories of backend data.
-   **Reproducible environment** --- Docker Compose provides a
    consistent way to build and run the complete application.
-   **Automated verification** --- unit tests and end-to-end Playwright
    tests provide validation at both component and application levels.
