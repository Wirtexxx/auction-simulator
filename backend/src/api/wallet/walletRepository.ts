import Wallet from "@/models/Wallet";
import type { Wallet as WalletType } from "./walletModel";

export interface CreateWalletData {
	_id: number;
	balance?: number;
}

export class WalletRepository {
	async create(data: CreateWalletData): Promise<WalletType> {
		const wallet = new Wallet({
			_id: data._id,
			balance: data.balance || 0,
		});
		await wallet.save();
		return this.toWalletType(wallet);
	}

	async findById(id: number): Promise<WalletType | null> {
		const wallet = await Wallet.findById(id);
		return wallet ? this.toWalletType(wallet) : null;
	}

	async updateBalance(id: number, balance: number): Promise<WalletType | null> {
		const wallet = await Wallet.findByIdAndUpdate(id, { balance }, { new: true });
		return wallet ? this.toWalletType(wallet) : null;
	}

	private toWalletType(wallet: {
		_id: number;
		balance: number;
	}): WalletType {
		return {
			_id: wallet._id,
			balance: wallet.balance,
		};
	}
}


