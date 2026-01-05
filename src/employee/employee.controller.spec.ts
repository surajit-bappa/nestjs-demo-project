import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';

describe('EmployeeController', () => {
  let controller: EmployeeController;

  const mockEmployeeService = {
    listEmployees: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeController],
      providers: [
        {
          provide: EmployeeService,
          useValue: mockEmployeeService,
        },
      ],
    }).compile();

    controller = module.get<EmployeeController>(EmployeeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return success when data exists', async () => {
    mockEmployeeService.listEmployees.mockResolvedValue([
      { emp_no: 'EMP001' },
    ]);

    const res = await controller.listEmployees();

    expect(res.status).toBe(1);
  });

  it('should return not found when no data', async () => {
    mockEmployeeService.listEmployees.mockResolvedValue([]);

    const res = await controller.listEmployees();

    expect(res.status).toBe(0);
  });
});
