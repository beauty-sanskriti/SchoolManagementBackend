import * as bcrypt from 'bcrypt';

import { db } from '../src/prisma/db.js';

async function seedSuperAdmin() {
  const email = 'superadmin@testschool.com';
  const password = 'newpassword456';

  const existingUser = await db.orm.public.User
    .where({
      email,
    })
    .first();

  if (existingUser) {
    if (existingUser.role !== 'SUPER_ADMIN') {
      throw new Error(
        'User with this email already exists with a different role',
      );
    }

    await db.orm.public.User
      .where({
        id: existingUser.id,
      })
      .update({
        emailVerified: true,
      });

    console.log('Super Admin already exists and was updated.');
    return;
  }

  const hashedPassword = await bcrypt.hash(
    password,
    10,
  );

  const user = await db.orm.public.User.create({
    email,
    name: 'Super Admin',
    username: 'superadmin',
    password: hashedPassword,
    role: 'SUPER_ADMIN',
    emailVerified: true,
    phoneVerified: false,
  });

  console.log(
    `Super Admin created successfully. ID: ${user.id}`,
  );
}

seedSuperAdmin()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
