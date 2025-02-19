import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
import { Body, Get, Post, Response, Route, SuccessResponse, Tags } from "tsoa";
import { UserAuthService } from "../../auth/auth.user.service";
import { PROJECT_KEY } from "../../config";
import { UserStatus } from "../../entity/user.entity";
import { InvalidCredentialsError, UserUnauthorizedError } from "../../errors/error";
import { UserRepository } from "../../repositories/user.repository";

interface UserLoginRequest {
	username: string;
	password: string;
}

@Tags("login")
@Route("/user/login")
@provide(UserLoginController)
export class UserLoginController {
	constructor(
		@inject(UserRepository) private userRepository: UserRepository,
		@inject(UserAuthService) private userAuthService: UserAuthService,
	) { }

	/**
	 * Checks username and password and generate a jwt token
	 * @param body username and password
	 * @returns token if user is authenticated
	 * @throws {InvalidCredentialsError} if user doesn't exist or password doesn't match
	 * @throws {UserUnauthorizedError} if user is not activated
	 */
	@Post("/")
	@Response<UserUnauthorizedError>(UserUnauthorizedError.status_code)
	@Response<InvalidCredentialsError>(InvalidCredentialsError.status_code)
	@SuccessResponse(200)
	async loginUser(@Body() body: UserLoginRequest) {
		const user = await this.userRepository.getOne({ username: body.username, project_key: PROJECT_KEY });
		if (user == null) {
			throw new InvalidCredentialsError("Invalid username or password");
		}
		const matched = await bcrypt.compare(body.password, user.bcrypt_hash);
		if (matched == null) {
			throw new InvalidCredentialsError("Invalid username or password");
		}
		if (user.status != UserStatus.ACTIVATED) {
			throw new UserUnauthorizedError("User not activated");
		}
		return this.userAuthService.generateToken(user);
	}

	/**
	 * If this username exist, throws error
	 * If this username doesn't exist, create user with this username and password
	 * @param body username and password
	 * @returns true if user is created
	 */
	@Post("/register")
	@Response<InvalidCredentialsError>(InvalidCredentialsError.status_code)
	@SuccessResponse(200)
	async registerUser(@Body() body: UserLoginRequest) {
		const existingAdminUsers = await this.userRepository.getOne({ is_admin: true, project_key: PROJECT_KEY });
		if (existingAdminUsers == null) {
			throw new InvalidCredentialsError("Admin user not initialized");
		}
		const existingUser = await this.userRepository.getOne({ username: body.username, project_key: PROJECT_KEY });
		if (existingUser != null) {
			throw new InvalidCredentialsError("User already exists");
		}
		await this.userRepository.create({
			username: body.username,
			bcrypt_hash: await bcrypt.hash(body.password, 10),
			is_admin: false,
			status: UserStatus.PENDING_VERIFICATION,
			token: randomUUID(),
			project_key: PROJECT_KEY
		});
		return true;
	}


	@Get("/initialized")
	@SuccessResponse(200)
	async getInitialized() {
		const existingUsers = await this.userRepository.getOne({ is_admin: true, project_key: PROJECT_KEY });
		return {
			isInitialized: existingUsers != null,
		};
	}

	/**
	 * Check if any admin user is available
	 * if admin user is present in db, throw error
	 * If admin user is not present, take username, password from body
	 * and create admin user
	 * @param body username and password
	 * @returns true if user is created
	 */
	@Post("/initialize")
	@Response<InvalidCredentialsError>(InvalidCredentialsError.status_code)
	@SuccessResponse(200)
	async initializeServer(@Body() body: UserLoginRequest) {
		const existingUsers = await this.userRepository.getOne({ is_admin: true, project_key: PROJECT_KEY });
		if (existingUsers != null) {
			throw new InvalidCredentialsError("Admin user already exists");
		}
		await this.userRepository.create({
			username: body.username,
			bcrypt_hash: await bcrypt.hash(body.password, 10),
			is_admin: true,
			status: UserStatus.ACTIVATED,
			token: randomUUID(),
			project_key: PROJECT_KEY
		});
		return true;
	}
}
