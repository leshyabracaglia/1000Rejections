import { renderHook, act } from "@testing-library/react-native";

const mockUser = { id: "user-1" };

jest.mock("../../lib/auth", () => ({
  useAuth: () => ({ user: mockUser }),
}));

jest.mock("expo-file-system/legacy", () => ({
  readAsStringAsync: jest.fn().mockResolvedValue("base64data"),
}));

jest.mock("base64-arraybuffer", () => ({
  decode: jest.fn((s: string) => s),
}));

function makeChain(resolvedValue: Record<string, unknown>) {
  const chain: Record<string, jest.Mock> = {};
  const self = () => chain;
  chain.select = jest.fn(self);
  chain.insert = jest.fn(self);
  chain.update = jest.fn(self);
  chain.delete = jest.fn(self);
  chain.eq = jest.fn(self);
  chain.order = jest.fn(self);
  chain.single = jest.fn(self);
  chain.then = jest.fn((resolve: (v: unknown) => void) =>
    resolve(resolvedValue),
  );
  return chain;
}

const mockFrom = jest.fn((_table: string) => makeChain({ data: null, error: null }));
const mockRpc = jest.fn();
const mockStorage = {
  from: jest.fn(() => ({
    upload: jest.fn().mockResolvedValue({ error: null }),
    getPublicUrl: jest.fn(() => ({
      data: { publicUrl: "https://example.com/image.jpg" },
    })),
  })),
};

jest.mock("../../lib/supabase", () => ({
  supabase: {
    from: (table: string) => mockFrom(table),
    storage: mockStorage,
    auth: {},
    rpc: (fn: string, args: unknown) => mockRpc(fn, args),
  },
}));

import { useRejections } from "../../hooks/useRejections";

describe("useRejections", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom.mockReturnValue(makeChain({ data: null, error: null }));
  });

  describe("fetchAllRejections", () => {
    it("returns normalized rejections for the current user", async () => {
      const rows = [
        {
          id: "1",
          user_id: "user-1",
          title: "Job App",
          description: null,
          image_url: null,
          date: "2025-06-01",
          status: "rejected",
          created_at: "2025-06-01T00:00:00Z",
        },
        {
          id: "2",
          user_id: "user-1",
          title: "Grant",
          description: "NSF",
          image_url: null,
          date: "2025-06-02",
          status: "pending",
          created_at: "2025-06-02T00:00:00Z",
        },
      ];

      mockFrom.mockReturnValue(makeChain({ data: rows, error: null }));

      const { result } = renderHook(() => useRejections());
      let data: Awaited<ReturnType<typeof result.current.fetchAllRejections>>;
      await act(async () => {
        data = await result.current.fetchAllRejections();
      });

      expect(data!).toHaveLength(2);
      expect(data![0].title).toBe("Job App");
      expect(data![0].status).toBe("rejected");
      expect(data![1].status).toBe("pending");
    });

    it("returns empty array on error", async () => {
      mockFrom.mockReturnValue(
        makeChain({ data: null, error: { message: "fail" } }),
      );

      const { result } = renderHook(() => useRejections());
      let data: Awaited<ReturnType<typeof result.current.fetchAllRejections>>;
      await act(async () => {
        data = await result.current.fetchAllRejections();
      });

      expect(data!).toEqual([]);
    });

  });

  describe("fetchRejectionById", () => {
    it("returns a single normalized rejection", async () => {
      const row = {
        id: "1",
        user_id: "user-1",
        title: "Job",
        description: null,
        image_url: null,
        date: "2025-06-01",
        status: "accepted",
        created_at: "2025-06-01T00:00:00Z",
      };

      mockFrom.mockReturnValue(makeChain({ data: row, error: null }));

      const { result } = renderHook(() => useRejections());
      let data: Awaited<ReturnType<typeof result.current.fetchRejectionById>>;
      await act(async () => {
        data = await result.current.fetchRejectionById("1");
      });

      expect(data!).not.toBeNull();
      expect(data!?.title).toBe("Job");
      expect(data!?.status).toBe("accepted");
    });

    it("returns null on error", async () => {
      mockFrom.mockReturnValue(
        makeChain({ data: null, error: { message: "not found" } }),
      );

      const { result } = renderHook(() => useRejections());
      let data: Awaited<ReturnType<typeof result.current.fetchRejectionById>>;
      await act(async () => {
        data = await result.current.fetchRejectionById("bad-id");
      });

      expect(data!).toBeNull();
    });
  });

  describe("createRejection", () => {
    it("calls supabase insert with correct payload", async () => {
      mockFrom.mockReturnValue(makeChain({ data: null, error: null }));

      const { result } = renderHook(() => useRejections());
      await act(async () => {
        await result.current.createRejection({
          title: "New App",
          description: null,
          date: "2025-06-15",
          image_url: null,
        });
      });

      expect(mockFrom).toHaveBeenCalledWith("rejections");
    });

    it("throws when insert fails", async () => {
      mockFrom.mockReturnValue(
        makeChain({ data: null, error: { message: "insert failed" } }),
      );

      const { result } = renderHook(() => useRejections());

      await expect(
        act(async () => {
          await result.current.createRejection({
            title: "Bad",
            description: null,
            date: "2025-06-15",
            image_url: null,
          });
        }),
      ).rejects.toThrow("insert failed");
    });
  });

  describe("removeRejection", () => {
    it("returns true on successful delete", async () => {
      mockFrom.mockReturnValue(makeChain({ data: null, error: null }));

      const { result } = renderHook(() => useRejections());
      let success: boolean;
      await act(async () => {
        success = await result.current.removeRejection("1");
      });

      expect(success!).toBe(true);
    });

    it("returns false on delete error", async () => {
      mockFrom.mockReturnValue(
        makeChain({ data: null, error: { message: "fail" } }),
      );

      const { result } = renderHook(() => useRejections());
      let success: boolean;
      await act(async () => {
        success = await result.current.removeRejection("1");
      });

      expect(success!).toBe(false);
    });
  });

  describe("updateRejectionStatus", () => {
    it("returns true on success", async () => {
      mockFrom.mockReturnValue(makeChain({ data: null, error: null }));

      const { result } = renderHook(() => useRejections());
      let success: boolean;
      await act(async () => {
        success = await result.current.updateRejectionStatus("1", "rejected");
      });

      expect(success!).toBe(true);
    });

    it("returns false on error", async () => {
      mockFrom.mockReturnValue(
        makeChain({ data: null, error: { message: "fail" } }),
      );

      const { result } = renderHook(() => useRejections());
      let success: boolean;
      await act(async () => {
        success = await result.current.updateRejectionStatus("1", "rejected");
      });

      expect(success!).toBe(false);
    });
  });

  describe("fetchPercentile", () => {
    it("returns null when count is 0 without calling the RPC", async () => {
      const { result } = renderHook(() => useRejections());
      let pct: number | null;
      await act(async () => {
        pct = await result.current.fetchPercentile(0);
      });

      expect(pct!).toBeNull();
      expect(mockRpc).not.toHaveBeenCalled();
    });

    it("returns null on error", async () => {
      mockRpc.mockResolvedValue({ data: null, error: { message: "fail" } });

      const { result } = renderHook(() => useRejections());
      let pct: number | null;
      await act(async () => {
        pct = await result.current.fetchPercentile(5);
      });

      expect(pct!).toBeNull();
    });

    it("calls the rejection_count_percentile RPC with the caller's count", async () => {
      mockRpc.mockResolvedValue({ data: 67, error: null });

      const { result } = renderHook(() => useRejections());
      let pct: number | null;
      await act(async () => {
        pct = await result.current.fetchPercentile(3);
      });

      expect(mockRpc).toHaveBeenCalledWith("rejection_count_percentile", {
        my_count: 3,
      });
      expect(pct!).toBe(67);
    });
  });
});
