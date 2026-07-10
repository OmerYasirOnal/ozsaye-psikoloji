import { expect, test } from "vitest";
import { jsonLdSerialize } from "./json-ld";

test("jsonLdSerialize: </script> kaçışı — HTML'e zararsız, JSON'a eşdeğer", () => {
  const kotu = { bio: "</script><script>alert(1)</script>" };
  const s = jsonLdSerialize(kotu);
  expect(s).not.toContain("</script>");
  expect(s).toContain("\\u003c/script");
  expect(JSON.parse(s)).toEqual(kotu); // JSON eşdeğerliği
});

test("jsonLdSerialize: U+2028/U+2029 kaçışı", () => {
  const s = jsonLdSerialize({ a: "x\u2028y\u2029z" });
  expect(s).not.toMatch(/[\u2028\u2029]/);
  expect(JSON.parse(s)).toEqual({ a: "x\u2028y\u2029z" });
});
