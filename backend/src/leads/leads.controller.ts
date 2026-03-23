import {
  Controller, Post, Get, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiResponse,
} from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import {
  CreateLeadDto, UpdateLeadStatusDto, AssignExpertDto, LeadFilterDto,
} from './dto/lead.dto';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('leads')
@Controller('leads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  /**
   * Called by the frontend "Plan Your Trip" funnel.
   * Public — no auth required (users may not be logged in yet).
   */
  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit a new trip enquiry (from the funnel)' })
  @ApiResponse({ status: 201, description: 'Lead created, expert will contact shortly' })
  create(
    @Body() dto: CreateLeadDto,
    @CurrentUser() user?: { id: string },
  ) {
    return this.leadsService.create(dto, user?.id);
  }

  /**
   * Admin / Expert: list all leads with filters & pagination.
   */
  @Get()
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.EXPERT)
  @ApiOperation({ summary: 'List all leads (admin/expert only)' })
  findAll(@Query() filter: LeadFilterDto) {
    return this.leadsService.findAll(filter);
  }

  /**
   * Get one lead by ID.
   */
  @Get(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.EXPERT)
  @ApiOperation({ summary: 'Get a single lead by ID' })
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  /**
   * Update lead status (e.g. CONTACTED → QUOTED → BOOKED).
   */
  @Patch(':id/status')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.EXPERT)
  @ApiOperation({ summary: 'Update lead status' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateLeadStatusDto) {
    return this.leadsService.updateStatus(id, dto);
  }

  /**
   * Assign a travel expert to a lead.
   */
  @Patch(':id/assign')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Assign a travel expert to a lead (admin only)' })
  assignExpert(@Param('id') id: string, @Body() dto: AssignExpertDto) {
    return this.leadsService.assignExpert(id, dto);
  }
}
