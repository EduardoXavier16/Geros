import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'mysql', // Tipo de banco de dados (MySQL)
  host: process.env.MYSQL_HOST || 'mysql.railway.internal', // Host do banco de dados
  port: parseInt(process.env.MYSQL_PORT || '8080', 10), // Porta do banco de dados
  username: process.env.MYSQL_USER || 'root', // Usuário do banco de dados
  password: process.env.MYSQL_PASSWORD, // Senha do banco de dados
  database: process.env.MYSQL_DATABASE || 'railway', // Nome do banco de dados
  synchronize: false, // Desative isso se estiver usando migrações
  logging: false, // Ative para depuração, se necessário
  entities: ['dist/entity/**/*.js'], // Caminho para suas entidades compiladas
  migrations: ['dist/migrations/**/*.js'], // Caminho para suas migrações compiladas
  subscribers: [],
});

export default AppDataSource;
