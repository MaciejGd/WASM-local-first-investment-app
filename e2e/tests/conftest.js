const BASE_URL = process.env.BASE_URL || "http://localhost:8080/";
const DATABASE_PATH = process.env.DATABASE_PATH || "../../backend/instance/application.sqlite";

module.exports= {
  BASE_URL,
  DATABASE_PATH,
};
