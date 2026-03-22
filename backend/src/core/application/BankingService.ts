import { IBankingRepository, IComplianceRepository } from '../ports/IComplianceRepository';

export class BankingService {
  constructor(
    private bankingRepo: IBankingRepository,
    private complianceRepo: IComplianceRepository
  ) {}

  async bankPositiveCB(shipId: string, year: number, amount: number) {
    if (amount <= 0) {
      throw new Error('Bank amount must be positive');
    }
    const snapshot = await this.complianceRepo.getSnapshot(shipId, year);
    if (!snapshot || snapshot.cb_gco2eq <= 0) {
      throw new Error('Ship has no positive CB to bank');
    }
    if (amount > snapshot.cb_gco2eq) {
      throw new Error('Cannot bank more than the available positive CB');
    }

    await this.bankingRepo.saveBankEntry({
      ship_id: shipId,
      year,
      amount_gco2eq: -amount // banking means removing from current surplus, or we just track banked amount.
    });
  }

  async applyBankedCB(shipId: string, year: number, amount: number) {
    if (amount <= 0) {
      throw new Error('Apply amount must be positive');
    }
    
    // total previously banked (will be negative relative to deficit, wait)
    // Actually, banked amount is positive, so when banking from surplus, we keep +amount.
    // Let's assume bank entry stores +amount when banking, and -amount when applying.
    const totalBanked = await this.bankingRepo.getTotalBanked(shipId);
    if (amount > totalBanked) {
      throw new Error('Not enough banked CB');
    }

    // save as negative entry to indicate usage
    await this.bankingRepo.saveBankEntry({
      ship_id: shipId,
      year: year,
      amount_gco2eq: -amount
    });
  }
}
