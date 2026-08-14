DROP TABLE IF EXISTS meta;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS wallet_assets;
DROP TABLE IF EXISTS sim_history;
DROP TABLE IF EXISTS user;

CREATE TABLE user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    salt TEXT NOT NULL
);

CREATE TABLE meta (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL, 
    hash TEXT NOT NULL, 
    user_id INTEGER NOT NULL,

    UNIQUE (user_id, table_name),

    FOREIGN KEY (user_id) REFERENCES user (id)
);

CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    type TEXT NOT NULL,
    ulid TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (id)
);

CREATE TABLE wallet_assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ulid TEXT UNIQUE NOT NULL,
    hash TEXT NOT NULL,
    payload BLOB NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (id)
);

CREATE TABLE sim_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    ulid TEXT UNIQUE NOT NULL,
    hash TEXT NOT NULL,
    payload BLOB NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (id)
);