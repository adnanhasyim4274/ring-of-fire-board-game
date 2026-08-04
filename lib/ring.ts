// ============================================================================
// RING OF FIRE v2.0 — Geometri cincin (murni matematika, tanpa aturan main)
//
// Papan ADALAH cincin: ubin ke-i diletakkan pada sudut (i / N) * 2pi - pi/2,
// jadi ubin 0 berada di puncak dan urutannya searah jarum jam.
// Rute Laut digambar sebagai busur yang MENGITARI Zona Krisis, bukan menembusnya.
// ============================================================================

/** Sisi viewBox SVG. Semua konstanta di bawah memakai satuan ini. */
export const VIEWBOX = 1000;
export const CENTRE = VIEWBOX / 2;

/** Jarak pusat cincin ke pusat ubin. */
export const RING_RADIUS = 416;

/** Circumradius heksagon (pusat ubin ke titik sudut). */
export const HEX_RADIUS = 52;

/** Radius tempat ujung busur Rute Laut menempel — tepat di sisi dalam cincin. */
const SEA_ANCHOR_RADIUS = RING_RADIUS - HEX_RADIUS - 12;

/** Seberapa dalam busur Rute Laut membusur ke arah pusat (fraksi dari anchor). */
const SEA_BOW = 0.74;

/** Radius piringan Zona Krisis di tengah cincin. */
export const CENTRE_RADIUS = 214;

export interface Point {
  x: number;
  y: number;
}

/** Sudut ubin dalam radian. Ubin 0 di puncak, lalu searah jarum jam. */
export function tileAngle(index: number, ringSize: number): number {
  return (index / ringSize) * Math.PI * 2 - Math.PI / 2;
}

function polar(radius: number, angle: number): Point {
  return {
    x: CENTRE + radius * Math.cos(angle),
    y: CENTRE + radius * Math.sin(angle),
  };
}

/** Titik pusat ubin ke-i pada cincin. */
export function tileCentre(index: number, ringSize: number): Point {
  return polar(RING_RADIUS, tileAngle(index, ringSize));
}

/**
 * Titik sudut heksagon, diputar mengikuti sudut ubin sehingga satu titik
 * mengarah radial keluar dan sisi datarnya menghadap ubin tetangga —
 * bentuk inilah yang membuat ubin terlihat "nyambung" saat disusun melingkar.
 */
export function hexPoints(centre: Point, radius: number, rotation: number): string {
  const pts: string[] = [];
  for (let k = 0; k < 6; k++) {
    const a = rotation + (k * Math.PI) / 3;
    pts.push(
      `${(centre.x + radius * Math.cos(a)).toFixed(2)},${(
        centre.y +
        radius * Math.sin(a)
      ).toFixed(2)}`
    );
  }
  return pts.join(" ");
}

/** Poligon heksagon untuk ubin ke-i, siap dipakai sebagai atribut `points`. */
export function tileHexPoints(index: number, ringSize: number, radius = HEX_RADIUS): string {
  const angle = tileAngle(index, ringSize);
  return hexPoints(polar(RING_RADIUS, angle), radius, angle);
}

/** Selisih sudut terpendek (radian) dari a ke b, hasil dalam (-pi, pi]. */
function angleDelta(a: number, b: number): number {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d <= -Math.PI) d += Math.PI * 2;
  return d;
}

/**
 * Jalur busur Rute Laut antara dua Pos Siaga bersebelahan.
 *
 * Kurva Bezier kuadratik yang titik tengahnya jatuh di radius
 * `SEA_ANCHOR_RADIUS * SEA_BOW` — cukup dalam untuk terlihat memotong sektor,
 * tapi tetap di LUAR piringan Zona Krisis, jadi busurnya mengitari pusat.
 */
export function seaRoutePath(a: number, b: number, ringSize: number): string {
  const angleA = tileAngle(a, ringSize);
  const angleB = tileAngle(b, ringSize);
  const mid = angleA + angleDelta(angleA, angleB) / 2;

  const p0 = polar(SEA_ANCHOR_RADIUS, angleA);
  const p1 = polar(SEA_ANCHOR_RADIUS, angleB);

  // Titik tengah kurva kuadratik = 0.25*P0 + 0.5*C + 0.25*P1. Untuk busur
  // simetris, radius titik tengah = 0.3536 * (rAnchor + rControl).
  const targetMid = SEA_ANCHOR_RADIUS * SEA_BOW;
  const chordFactor = Math.abs(Math.cos(angleDelta(angleA, angleB) / 2)) / 2;
  const controlRadius = Math.max(
    40,
    (targetMid - SEA_ANCHOR_RADIUS * chordFactor) / 0.5
  );
  const c = polar(controlRadius, mid);

  return `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} Q ${c.x.toFixed(2)} ${c.y.toFixed(
    2
  )} ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
}

/** Titik label di tengah busur Rute Laut. */
export function seaRouteLabelPoint(a: number, b: number, ringSize: number): Point {
  const angleA = tileAngle(a, ringSize);
  const mid = angleA + angleDelta(angleA, tileAngle(b, ringSize)) / 2;
  return polar(SEA_ANCHOR_RADIUS * SEA_BOW, mid);
}

/** Tetangga rim: (i-1+N)%N dan (i+1)%N. Murni topologi cincin. */
export function rimNeighbors(index: number, ringSize: number): [number, number] {
  return [(index - 1 + ringSize) % ringSize, (index + 1) % ringSize];
}

/** Apakah dua indeks terhubung lewat salah satu Rute Laut. */
export function sharesSeaRoute(
  a: number,
  b: number,
  seaRoutes: readonly (readonly [number, number])[]
): boolean {
  return seaRoutes.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}
