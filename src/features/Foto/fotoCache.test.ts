import { beforeEach, describe, expect, it, vi } from "vitest";
import Api from "../../config/api";
import { invalidarFoto, limparFotos, obterFoto } from "./fotoCache";

describe("fotoCache", () => {
  beforeEach(() => {
    limparFotos();
    URL.createObjectURL = vi.fn(() => "blob:foto");
    URL.revokeObjectURL = vi.fn();
  });

  it("baixa a foto uma vez e reaproveita nas próximas chamadas", async () => {
    const get = vi.spyOn(Api, "get").mockResolvedValue({ status: 200, data: new Blob(["x"]) });

    expect(await obterFoto(5)).toBe("blob:foto");
    expect(await obterFoto(5)).toBe("blob:foto");
    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith("/User/5/foto", { responseType: "blob" });
  });

  it("devolve null para quem não tem foto (204) e também guarda isso", async () => {
    const get = vi.spyOn(Api, "get").mockResolvedValue({ status: 204, data: new Blob([]) });

    expect(await obterFoto(6)).toBeNull();
    expect(await obterFoto(6)).toBeNull();
    expect(get).toHaveBeenCalledTimes(1);
  });

  it("devolve null se a busca falhar", async () => {
    vi.spyOn(Api, "get").mockRejectedValue(new Error("rede"));
    expect(await obterFoto(7)).toBeNull();
  });

  it("depois de invalidar, busca a foto de novo", async () => {
    const get = vi.spyOn(Api, "get").mockResolvedValue({ status: 200, data: new Blob(["x"]) });

    await obterFoto(8);
    invalidarFoto(8);
    await obterFoto(8);

    expect(get).toHaveBeenCalledTimes(2);
  });
});
