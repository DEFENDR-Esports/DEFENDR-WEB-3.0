import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { TokenService } from './token.service';

@Controller('token')
export class TokenController {
  private readonly logger = new Logger(TokenController.name);

  constructor(private readonly tokenService: TokenService) {}

  /**
   * Create DEFENDR-R token (fungible reward token)
   * This will create the token and automatically associate it with the treasury
   */
  @Post('create-defendr-r')
  async createDefendrRToken(): Promise<{
    success: boolean;
    tokenId: string;
    transactionId: string;
    associated: boolean;
    message: string;
  }> {
    try {
      this.logger.log('Creating DEFENDR-R token...');

      const result = await this.tokenService.createDefendrRToken();

      return {
        success: true,
        tokenId: result.tokenId,
        transactionId: result.transactionId,
        associated: result.associated,
        message: `DEFENDR-R token created successfully! Token ID: ${result.tokenId}`,
      };
    } catch (error) {
      this.logger.error(`Error creating DEFENDR-R token: ${error.message}`);
      throw new HttpException(
        error.message || 'Error creating DEFENDR-R token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Mint additional DEFENDR-R tokens to treasury
   */
  @Post('mint-defendr-r')
  async mintDefendrRTokens(
    @Body() body: { amount: number },
  ): Promise<{
    success: boolean;
    status: string;
    transactionId: string;
    newTotalSupply: string;
    message: string;
  }> {
    try {
      if (!body.amount || body.amount <= 0) {
        throw new HttpException(
          'Amount must be greater than 0',
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(`Minting ${body.amount} DEFENDR-R tokens...`);

      const result = await this.tokenService.mintDefendrRTokens(body.amount);

      return {
        success: true,
        status: result.status,
        transactionId: result.transactionId,
        newTotalSupply: result.newTotalSupply,
        message: `Successfully minted ${body.amount} DEFENDR-R tokens`,
      };
    } catch (error) {
      this.logger.error(`Error minting DEFENDR-R tokens: ${error.message}`);
      throw new HttpException(
        error.message || 'Error minting DEFENDR-R tokens',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
