import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  let controller: AppController;
  let service: AppService;

  const mockAppService = {
    getHello: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
    service = module.get<AppService>(AppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getHello", () => {
    it("should return hello message", () => {
      const expectedMessage = "Hello World!";
      mockAppService.getHello.mockReturnValue(expectedMessage);

      const result = controller.getHello();

      expect(result).toBe(expectedMessage);
      expect(service.getHello).toHaveBeenCalled();
    });

    it("should handle service returning different messages", () => {
      const customMessage = "Custom Hello Message";
      mockAppService.getHello.mockReturnValue(customMessage);

      const result = controller.getHello();

      expect(result).toBe(customMessage);
      expect(service.getHello).toHaveBeenCalled();
    });
  });
});
