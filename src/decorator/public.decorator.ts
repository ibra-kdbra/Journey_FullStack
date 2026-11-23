import {SetMetadata} from "@nestjs/common";

/** Marks a route (or controller) as exempt from the global JWT guard. Use sparingly and add another guard. */
export const Public = () => SetMetadata('isPublic', true);
