import { Context, Operations } from "../types";
import { fetchTenantParents } from "../tenancy/logic";
import { env } from "../tenancy";

export async function isGlobalAdmin({ session, context }: Context) {
  if (!session) return false;
  return (
    (
      await context.sudo().query.Permission.findMany({
        where: {
          tenant: { title: { equals: env.TENANT_GLOBAL_TITLE } },
          delegates: { some: { id: { equals: session.itemId } } },
        },
      })
    ).length === Operations.options.length
  );
}

export async function can(
  { session, context }: Context,
  tenant: { id: string } | string,
  operation: "C" | "R" | "U" | "D"
): Promise<Boolean> {
  if (await isGlobalAdmin({ session, context })) return true;
  const tenants = await fetchTenantParents(
    { context },
    { id: { equals: typeof tenant === "string" ? tenant : tenant.id } }
  );
  const permissions = await context.query.Permission.findMany({
    where: {
      operation: { equals: operation },
      tenant: { id: { in: tenants.flat(Infinity) } },
      delegates: { some: { id: { equals: session?.itemId } } },
    },
    query: "operation tenant { title }",
  });
  console.log(permissions);
  return permissions.length > 0;
}
