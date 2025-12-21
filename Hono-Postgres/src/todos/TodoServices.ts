/** @notice library imports */
/// Local imports
import { todos } from "@/schemas";
import { database } from "@/config/database";

type ICreateParams = {
  description: string;
};

export class TodoServices {
  async create(params: ICreateParams) {
    const result = await database.insert(todos).values(params).returning({
      id: todos.id,
    });
    return result.at(0)!;
  }
}
