import type { ExecArgs } from '@medusajs/framework/types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';

/**
 * Seed Rehab Store with 4 collections, 8 sample products, and admin user.
 */
export default async function seed({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productModule: any = container.resolve(Modules.PRODUCT);

  logger.info('Seeding Rehab Store...');

  const collections = [
    { handle: 'soft-tailoring', title: 'Soft Tailoring' },
    { handle: 'rehab-knitwear', title: 'Rehab Knitwear' },
    { handle: 'bone-rose', title: 'Bone & Rose' },
    { handle: 'lookbook-01', title: 'Lookbook 01' },
  ];

  const created = await productModule.createCollections(
    collections.map((c) => ({ ...c })),
  );
  logger.info(`Created ${created.length} collections.`);

  try {
    const authModule: any = container.resolve(Modules.AUTH);
    const userModule: any = container.resolve(Modules.USER);

    await authModule.register('user', 'emailpass', {
      email: 'admin@rehab.store',
      password: 'supersecret',
    });
    logger.info('Created auth identity for admin@rehab.store');

    await userModule.createUsers([
      { email: 'admin@rehab.store', first_name: 'Admin', last_name: 'User' },
    ]);
    logger.info('Created admin user: admin@rehab.store');
  } catch (error: any) {
    if (error.message?.toLowerCase().includes('already exist')) {
      logger.info('Admin user already exists, skipping');
    } else {
      logger.warn(`Admin user may already exist: ${error.message}`);
    }
  }

  logger.info('Seed complete.');
}
