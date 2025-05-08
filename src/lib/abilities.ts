import { AbilityBuilder, Ability, AbilityClass } from "@casl/ability";

// Define tipos para acciones y sujetos dinámicos
type DynamicActions = string;
type DynamicSubjects = string | Record<string, any>;

export type AppAbility = Ability<[DynamicActions, DynamicSubjects]>;

// Construir habilidades dinámicas
export const defineAbilitiesFor = (user: any): AppAbility => {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
        Ability as AbilityClass<AppAbility>
    );

    if (user?.role?.allowAll) {
        can("manage", "all");
        return build({
            detectSubjectType: (item) => item!.type || item,
        });
    } else {
        user?.role?.role_has_permissions?.forEach((permission: any) => {
            const actions = Array.isArray(permission.actions) ? permission.actions : JSON.parse(permission.actions || '[]');
            let subject = permission.routeCode;
        
            actions.forEach((action: string) => {
                can(action, subject);
            });
        
            const restrictions = Array.isArray(permission.restrictions) ? permission.restrictions : JSON.parse(permission.restrictions || '[]');
            restrictions.forEach((restriction: string) => {
                cannot(restriction, subject);
            });
        });
    }

    return build({
        detectSubjectType: (item) => item!.type || item,
    });
};