import { hashAdminPassword } from "@/modules/admin/application/password-hash";

async function main() {
  const password = process.argv[2];

  if (!password) {
    throw new Error('Usage: npm run admin:hash-password -- "my-password"');
  }

  console.log(await hashAdminPassword(password));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
