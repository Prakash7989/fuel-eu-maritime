import { IBankingRepository, IComplianceRepository } from '../ports/IComplianceRepository';

export class BankingService {
  constructor(
    private complianceRepo: IComplianceRepository,
    private bankingRepo: IBankingRepository
  ) { }

  async bankPositiveCB(shipId: string, year: number, amount: number) {
    if (amount <= 0) {
      throw new Error('Bank amount must be positive');
    }
    const snapshot = await this.complianceRepo.getSnapshot(shipId, year);
    if (!snapshot || snapshot.cb_gco2eq <= 0) {
      throw new Error('Ship has no positive CB to bank');
    }

    const previouslyBanked = await this.bankingRepo.getTotalBanked(shipId);
    const available = snapshot.cb_gco2eq - previouslyBanked;

    if (amount > available) {
      throw new Error(`Cannot bank amount. Maximum available to bank is ${available}`);
    }

    await this.bankingRepo.saveBankEntry({
      ship_id: shipId,
      year,
      amount_gco2eq: amount
    });
  }

  async applyBankedCB(shipId: string, year: number, amount: number) {
    if (amount <= 0) {
      throw new Error('Apply amount must be positive');
    }

    const totalBanked = await this.bankingRepo.getTotalBanked(shipId);
    if (amount > totalBanked) {
      throw new Error(`Insufficient banked CB. Available: ${totalBanked}`);
    }

    // save as negative entry to indicate usage
    await this.bankingRepo.saveBankEntry({
      ship_id: shipId,
      year: year,
      amount_gco2eq: -amount
    });
  }
}
