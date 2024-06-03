# System design principles using NodeJs

SOLID software system principles using Nodejs + TypeScript + Express

## installation

1- run the following command to install required packages

```shell
yarn
```

2- rename the .env.example file to .env and update it with required environment variables

2- run the following commands to migrate the database tables with dummy data

```shell
yarn migrate:up
yarn seed:up
```

## Commands

```shell
yarn dev #start dev server
yarn build #build production version
yarn start #build + start production version
yarn migrate:up #migrate the tables
yarn migrate:down #undo migration script
yarn seed:up #seeding dummy data
yarn seed:down #undo seeding
```

### available endpoints

```rest
GET /users/
GET /users/:id
PUT /users/:id
GET /users/export/:type
GET /users/orders/:id

POST /pay
POST /notification/send
POST /transfer/:platform

```

## Software design SOLID principals

### 1- The Single Responsibility Principle (SRP)

is one of the five principles of software design known as the SOLID principles. It emphasizes the idea that a class or module should have only one reason to change, or in other words, it should have only one responsibility.

the Single Responsibility Principle can lead to more modular and maintainable code. Each class or module has a clear responsibility, making it easier to understand, test, and modify individual components without affecting unrelated functionalities.

for example:

```ts
src / models / Order.ts;
src / models / User.ts;

src / controllers / OrderController.ts;
src / controllers / UserController.ts;

src / services; //each service has one resposibilty
```

## 2- The Open/Closed Principle (OCP)

is another principle of the SOLID design principles. It states that software entities (classes, modules, functions, etc.) should be open for extension but closed for modification. In other words, the behavior of a software entity should be easily extended without modifying its existing code.

```ts
interface FileExporter {
  exportFile(data: User[]): Promise<void | WriteStream>;
}

export default class ExcelExporter implements FileExporter {
  async exportFile(data: User[]) {
    //implementation
  }
}

export default class PdfExporter implements FileExporter {
  async exportFile(data: User[]) {
    //implementation
  }
}
const exporter = new ExcelExporter();
await exportData(exporter, users);

async function exportData(exportType: FileExporter, data: Array<User>) {
  await exportType.exportFile(data);
}
```

In this example, the OCP is followed by introducing the FileExporter interface. This interface defines the exportFile() method that each concrete file exporter class must implement. The ExcelExporter and PdfExporter are concrete implementations of the FileExporter interface, each providing their own logic for exporting the file to pdf or excel.

The exportData service uses the selected exportType to generate the file and invoking the exportFile() method. The important aspect is that if a new file exporter needs to be added (e.g., a word exporter), it can be done by creating a new class that implements the FileExporter interface, without modifying the existing code.

## 3- The Liskov Substitution Principle (LSP)

is one of the SOLID principles that guides the design of object-oriented software. It states that objects of a superclass should be substitutable with objects of its subclasses without affecting the correctness of the program.

```ts
interface PaymentInterface {
  amount: number;

  pay(): number;
}

class CashPayment implements PaymentInterface {
  private tax = 12;
  amount: number;

  constructor(amount: number) {
    this.amount = amount;
  }

  pay(): number {
    this.amount += this.tax;
    /**
     * @todo implement CashPayment login here
     */
    return this.amount;
  }
}

class CardPayment implements PaymentInterface {
  private tax = 0;
  amount: number;

  constructor(amount: number) {
    this.amount = amount;
  }

  pay(): number {
    this.amount += this.tax;
    /**
     * @todo implement CardPayment login here
     */
    return this.amount;
  }
}

const cash = new CashPayment(20);
const card = new CardPayment(20);

const amount = payService(card);

function payService(paymentService: PaymentInterface) {
  const paidAmount = paymentService.pay();
  return paidAmount;
}
```

In this example, the payService() function takes a PaymentInterface object as a parameter and calls its pay() method. It works correctly with both CashPayment and CardPayment objects because they are substitutable for PaymentInterface.

The Liskov Substitution Principle ensures that subclasses can be used as drop-in replacements for their base class without breaking the program's correctness. In the example, both CashPayment and CardPayment properly implement the pay() method as required by the PaymentInterface interface, and the behavior of the program remains consistent when using different types.

## 4- The Interface Segregation Principle (ISP)

is one of the SOLID principles that focuses on the idea of designing small, focused interfaces that are specific to the needs of clients, rather than creating large, monolithic interfaces.

```ts
interface SMSHandlerInterface {
  handleSMS(message: string): boolean;
}
interface EmailHandlerInterface {
  handleEmail(message: string): boolean;
}
interface PNHandlerInterface {
  handlePushNotification(message: string): boolean;
}
class SMSHandler implements SMSHandlerInterface {
  handleSMS(message: string): boolean {
    console.log(`implementing SMS Handler ${message}`);
    return true;
  }
}
class EmailHandler implements EmailHandlerInterface {
  handleEmail(message: string): boolean {
    console.log(`implementing Email Handler ${message}`);
    return true;
  }
}
class PNHandler implements PNHandlerInterface {
  handlePushNotification(message: string): boolean {
    console.log(`implementing Push notification handler ${message}`);
    return true;
  }
}
```

In this example, we have created separate interfaces for each type of message handler (SMSHandlerInterface, EmailHandlerInterface, and PNHandlerInterface). Each interface defines a specific method related to its respective message type.

By splitting the interfaces, clients can now depend only on the interfaces that are relevant to their needs. For instance, a client interested in handling sms messages can depend on the SMSHandlerInterface, and a client interested in handling email messages can depend on the EmailHandlerInterface. This adheres to the Interface Segregation

## 5- The Dependency Inversion Principle (DIP)

is one of the SOLID principles that focuses on decoupling high-level modules from low-level modules by introducing abstractions. It promotes the idea that high-level modules should not depend on the details of low-level modules, but both should depend on abstractions.

```ts
interface TransferInterface {
  transfer($amount: number): boolean;
}
class PayPalTransfer implements TransferInterface {
  transfer($amount: number): boolean {
    /** @todo implement PayPal Transfer */
    return true;
  }
}

class StripeTransfer implements TransferInterface {
  transfer($amount: number): boolean {
    /**@toDo implement Strip here */
    return true;
  }
}
class TransferManager {
  private transferService: TransferInterface;
  constructor(_transferService: TransferInterface) {
    this.transferService = _transferService;
  }

  transferMoney($amount: number) {
    this.transferService.transfer($amount);
  }
}
const paypal = new PayPalTransfer();
const transfer = new TransferManager(paypal);
transfer.transferMoney(req.body.amount);
```

In this example, we introduce the TransferInterface interface that defines the transfer() method. The low-level services (PayPalTransfer and StripeTransfer) implement TransferInterface and provide their own implementations of the method.

The TransferManager class now depends on the TransferInterface abstraction rather than the concrete implementations. It accepts an object in its constructor, enabling the use of any implementation that adheres to the TransferInterface interface.

This approach adheres to the Dependency Inversion Principle by decoupling high-level and low-level modules through abstraction. The TransferManager is no longer directly coupled to the concrete transfer services, making it easier to replace or add new transfer services without modifying the manager's code.

<hr>

## DRY

(Don't Repeat Yourself) principle encourages to avoid duplicating code and promote code reuse. When working with a Node.js project using TypeScript, here are some ways to apply the DRY principle effectively:

1- Reusing Type Definitions:

```ts
// Define reusable types
export default interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
}

export class User extends Model<UserAttributes> implements UserAttributes {
  setPassword(password: string) {
    this.password = password;
  }
}
```

By defining the shared types in a separate module, you can import and reuse them across multiple files without duplicating the type definitions.

2- Reusable Functions:

```ts
// Utility Function
const hashPassword = (password: string): string => {
  const hash = bcrypt.hashSync(password + pepper, parseInt(salt as string, 10));
  return hash;
};
// Usage in different files
if (user.changed("password")) {
  user.setPassword(hashPassword(user.password));
}
```

By creating a reusable utility function, you can avoid duplicating the password hashing logic in multiple places and simply import and use the function where needed.

3- Shared Configuration:

```ts
// Configuration File
export default {
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
  host: process.env.DATABASE_HOST,
  salt: process.env.SALT_ROUNDS,
  pepper: process.env.BCRYPT_PASSWORD,
  email_user: process.env.EMAIL_USER,
  email_password: process.env.EMAIL_PASSWORD,
  email_provider: process.env.EMAIL_PROVIDER,
  email_from: process.env.EMAIL_FROM,
};

// Usage in different files
import config from "./EnvConfig";
// Use the configuration values
const { username, password, database, host } = config;
```

4- Use an ORM (Object-Relational Mapping) Framework:
ORM frameworks like Sequelize, TypeORM, or Prisma provide abstractions to interact with the database. They allow you to define models, query the database using an object-oriented approach, and handle database operations without directly writing SQL queries. By using an ORM, you can centralize database-related code and reuse it across different parts of your application.

- Use migrations and seeders to automate creation of schemas and data

- Define Models with Associations:
  Sequelize allows you to define models that represent your database tables. By defining associations between models, you can reuse these associations instead of duplicating the relationship definitions in multiple places. For example:

```ts
// User Model
User
  .init
  // User attributes
  ();

// Order Model
Order
  .init
  // Order attributes
  ();

User.hasMany(Order);
Order.belongsTo(User);

const user = await User.findByPk(req.params.userId, {
  include: Order,
});

res.json(user?.Orders);
```

- Encapsulate Reusable Query Logic:
  If you find yourself performing similar operations in multiple places, consider encapsulating the logic in reusable functions or static methods within the model Or simply by using Hooks provided by Sequelize ORM. For example:

```ts
User.beforeUpdate((user: User) => {
  if (user.changed("password")) {
    user.setPassword(hashPassword(user.password));
  }
});

User.beforeCreate((user: User) => {
  user.setPassword(hashPassword(user.password));
});
```

5- Define Reusable Validation Middleware:
Create a validation middleware that encapsulates common validation rules and logic. This middleware can be used across different endpoints or routes, eliminating the need to repeat the same validation code for each endpoint.

```ts
export function ValidateParams(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.params);

    if (error) {
      // Handle validation error
      return res.status(400).json({ error: error.details[0].message });
    }

    // Params are valid, proceed to the next middleware
    next();
  };
}
export const ExportTypeSchema = Joi.object({
  type: Joi.string()
    .valid(...["excel", "pdf"])
    .required(),
});

userRoutes.get("/export/:type", ValidateParams(ExportTypeSchema), exportFile);
```
