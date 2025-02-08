import { HttpStatusCodeLiteral } from "tsoa";

export class CustomError {
  public class_name: string;
  constructor(
    public status_code: number,
    public message: string,
    public details?: string
  ) {
    this.class_name = this.constructor.name;
  }
}

export class UserUnauthorizedError extends CustomError {
  static status_code: HttpStatusCodeLiteral = 401;
  constructor(public message: string, public details?: string) {
    super(UserUnauthorizedError.status_code, message, details);
  }
}

export class InvalidCredentialsError extends CustomError {
  static status_code: HttpStatusCodeLiteral = 403;
  constructor(
    public message: string,
    public details: string = "Invalid Credentials"
  ) {
    super(InvalidCredentialsError.status_code, message, details);
  }
}
