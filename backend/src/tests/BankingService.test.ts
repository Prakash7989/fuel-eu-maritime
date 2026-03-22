import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { BankingService } from '../core/application/BankingService';
import { IBankingRepository, IComplianceRepository } from '../core/ports/IComplianceRepository';

describe('BankingService', () => {
    let mockBankRepo: jest.Mocked<IBankingRepository>;
    let mockCompRepo: jest.Mocked<IComplianceRepository>;
    let bankingService: BankingService;

    beforeEach(() => {
        mockBankRepo = {
            getBankEntries: jest.fn(),
            saveBankEntry: jest.fn(),
            getTotalBanked: jest.fn(),
        } as any;
        mockCompRepo = {
            getSnapshot: jest.fn(),
        } as any;

        bankingService = new BankingService(mockCompRepo, mockBankRepo);
    });

    it('should bank positive surplus', async () => {
        mockCompRepo.getSnapshot.mockResolvedValue({
            id: 1, ship_id: 'R002', year: 2025, cb_gco2eq: 5000
        });
        mockBankRepo.getTotalBanked.mockResolvedValue(0);

        await expect(bankingService.bankPositiveCB('R002', 2025, 2000)).resolves.not.toThrow();
        expect(mockBankRepo.saveBankEntry).toHaveBeenCalledWith(expect.objectContaining({
            amount_gco2eq: 2000
        }));
    });

    it('should throw when banking more than surplus', async () => {
        mockCompRepo.getSnapshot.mockResolvedValue({
            id: 1, ship_id: 'R002', year: 2025, cb_gco2eq: 5000
        });
        mockBankRepo.getTotalBanked.mockResolvedValue(4000);

        await expect(bankingService.bankPositiveCB('R002', 2025, 2000))
            .rejects.toThrow('Cannot bank amount. Maximum available to bank is 1000');
    });

    it('should apply banked surplus', async () => {
        mockBankRepo.getTotalBanked.mockResolvedValue(10000);
        await expect(bankingService.applyBankedCB('R001', 2025, 5000)).resolves.not.toThrow();
        expect(mockBankRepo.saveBankEntry).toHaveBeenCalledWith(expect.objectContaining({
            amount_gco2eq: -5000
        }));
    });

    it('should throw when applying more than banked', async () => {
        mockBankRepo.getTotalBanked.mockResolvedValue(3000);
        await expect(bankingService.applyBankedCB('R001', 2025, 5000))
            .rejects.toThrow('Insufficient banked CB. Available: 3000');
    });
});
