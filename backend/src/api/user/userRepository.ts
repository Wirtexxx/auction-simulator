import User from "@/models/User";
import type { User as UserType } from "./userModel";

export interface CreateUserData {
	_id: number; // telegram_user_id
	username: string;
	first_name: string;
	last_name?: string;
	photo_url?: string;
	language_code?: string;
	is_premium?: boolean;
	role?: "user" | "admin";
}

export class UserRepository {
	async create(data: CreateUserData): Promise<UserType> {
		const user = new User(data);
		await user.save();
		return this.toUserType(user);
	}

	async findById(id: number): Promise<UserType | null> {
		const user = await User.findById(id);
		return user ? this.toUserType(user) : null;
	}

	async findByTelegramUserId(telegram_user_id: number): Promise<UserType | null> {
		const user = await User.findById(telegram_user_id);
		return user ? this.toUserType(user) : null;
	}

	private toUserType(user: {
		_id: number;
		username: string;
		first_name: string;
		last_name?: string | null;
		photo_url?: string | null;
		language_code?: string | null;
		is_premium: boolean;
		role: "user" | "admin";
		created_at: Date;
	}): UserType {
		return {
			_id: user._id,
			username: user.username,
			first_name: user.first_name,
			last_name: user.last_name || null,
			photo_url: user.photo_url || null,
			language_code: user.language_code || null,
			is_premium: user.is_premium,
			role: user.role,
			created_at: user.created_at,
		};
	}
}
