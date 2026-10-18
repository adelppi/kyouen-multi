import { describe, expect, it } from "vitest";
import { describeOperation } from "./history";
import type { Operation, OperationBody } from "./operations";

const op = (body: OperationBody): Operation => ({ ...body, by: { userId: "alice-0001", name: "A", color: "#000" }, at: 0 });

describe("describeOperation", () => {
  it("置くと取り除くは、格子点を1から数えて出す", () => {
    expect(describeOperation(op({ type: "place", x: 0, y: 2 }))).toBe("1列 3行に置いた");
    expect(describeOperation(op({ type: "remove", x: 4, y: 0 }))).toBe("5列 1行から取り除いた");
  });

  it("ほかの操作は種類を出す", () => {
    expect(describeOperation(op({ type: "reset" }))).toBe("リセットした");
    expect(describeOperation(op({ type: "resize", size: 13 }))).toBe("サイズを 13×13 にした");
    expect(describeOperation(op({ type: "undo" }))).toBe("元に戻した");
    expect(describeOperation(op({ type: "redo" }))).toBe("やり直した");
  });
});
