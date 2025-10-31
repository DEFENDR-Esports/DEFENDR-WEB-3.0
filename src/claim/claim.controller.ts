import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ClaimService,
  ClaimNftRequest,
  ClaimNftResponse,
} from './claim.service';

@Controller('claim')
export class ClaimController {
  private readonly logger = new Logger(ClaimController.name);

  constructor(private readonly claimService: ClaimService) {}

  /**
   * Endpoint to claim an NFT with mission data and receive DEFENDR-R tokens
   * 
   * @param request - Contains user info, mission data, and token amount
   * @returns ClaimNftResponse with NFT details and token transfer info
   */
  @Post('nft')
  async claimNft(@Body() request: ClaimNftRequest): Promise<ClaimNftResponse> {
    try {
      // Validate basic data
      if (!request.user) {
        throw new HttpException(
          'User information is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!request.mission) {
        throw new HttpException(
          'Mission information is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!request.tokenAmount || request.tokenAmount <= 0) {
        throw new HttpException(
          'Invalid token amount',
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(
        `NFT claim attempt for user: ${request.user.accountId}, mission: ${request.mission.id}`,
      );

      const result = await this.claimService.claimNftWithMission(request);
      
      return result;
    } catch (error) {
      this.logger.error(`Error during claim: ${error.message}`);
      throw new HttpException(
        error.message || 'Error claiming NFT',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Health check for the claim service
   */
  @Post('health')
  async healthCheck(): Promise<{ status: string; message: string }> {
    return {
      status: 'ok',
      message: 'Claim service operational',
    };
  }
}

