import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Tool } from '../tools/entities/tool.entity';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ?? 'matiz',
  entities: [Tool],
  synchronize: false,
});

const TOOLS = [
  {
    name: 'Lightroom',
    slug: 'lightroom',
    defaultFields: [
      'Exposición',
      'Contraste',
      'Iluminaciones',
      'Sombras',
      'Blancos',
      'Negros',
      'Claridad',
      'Vibración',
      'Saturación',
      'Temperatura',
      'Tinte',
    ],
  },
  {
    name: 'VSCO',
    slug: 'vsco',
    defaultFields: [
      'Exposición',
      'Contraste',
      'Saturación',
      'Temperatura',
      'Tinte',
      'Nitidez',
      'Fade',
      'Sombras',
    ],
  },
  {
    name: 'Editor nativo',
    slug: 'editor-nativo',
    defaultFields: [
      'Exposición',
      'Brillo',
      'Contraste',
      'Saturación',
      'Temperatura',
      'Vibración',
      'Realce',
      'Definición',
    ],
  },
];

async function seed() {
  await dataSource.initialize();
  const repo = dataSource.getRepository(Tool);

  for (const tool of TOOLS) {
    const exists = await repo.findOne({ where: { slug: tool.slug } });
    if (!exists) {
      await repo.save(repo.create(tool));
      console.log(`✓ Seeded: ${tool.name}`);
    } else {
      await repo.update({ slug: tool.slug }, { defaultFields: tool.defaultFields });
      console.log(`↺ Updated: ${tool.name}`);
    }
  }

  await dataSource.destroy();
  console.log('Done.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
