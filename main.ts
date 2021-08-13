import question from "https://raw.githubusercontent.com/ocpu/question-deno/master/mod.ts";

const BASE_URL = "https://wwwqis-2rz.itmz.hs-rm.de";

async function getCookie(username: string, password: string): Promise<string> {
  const url =
    `${BASE_URL}/qisserver/rds?state=user&type=1&category=auth.login&startpage=portal.vm&breadCrumbSource=portal`;

  const request = new Request(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `asdf=${username}&fdsa=${password}`,
  });
  const response = await fetch(request, { redirect: "manual" });

  if (response.status === 200) {
    const text = await response.text();
    if (text.includes("Anmeldung fehlgeschlagen")) {
      throw "wrong login credentials";
    }
  }
  if (response.status !== 302) throw "expected status 302";
  if (!response.headers.has("set-cookie")) throw "expected set-cookie header";

  const cookie = response.headers.get("set-cookie")?.split("; ")[0];

  if (cookie == null) throw "no cookie found";

  return cookie;
}

async function getAsi(cookie: string): Promise<string> {
  const url =
    `${BASE_URL}/qisserver/rds?state=change&type=1&moduleParameter=studyPOSMenu&nextdir=change&next=menu.vm&subdir=applications&xml=menu&purge=y&navigationPosition=functions%2CstudyPOSMenu&breadcrumb=studyPOSMenu&topitem=functions&subitem=studyPOSMenu`;

  const request = new Request(url, {
    method: "GET",
    headers: {
      Cookie: cookie,
    },
  });

  const response = await fetch(request);

  if (response.status !== 200) throw "expected status 200";

  const text = await response.text();

  const match = text.match(/asi=(.{20})/);

  if (match == null) throw "no asi found";

  return match[1];
}

async function getAbschlussId(cookie: string, asi: string): Promise<string> {
  const url =
    `${BASE_URL}/qisserver/rds?state=notenspiegelStudent&next=tree.vm&nextdir=qispos/notenspiegel/student&menuid=notenspiegelStudent&breadcrumb=notenspiegel&breadCrumbSource=menu&asi=${asi}`;

  const request = new Request(url, {
    method: "GET",
    headers: {
      Cookie: cookie,
    },
  });

  const response = await fetch(request);

  if (response.status !== 200) throw "expected status 200";

  const text = await response.text();

  const match = text.match(/#(auswahlBaum.*)"/);

  if (match == null) throw "no abschluss id found";

  return match[1];
}

async function getNotenSpiegelHtml(
  cookie: string,
  asi: string,
  abschlussId: string,
): Promise<string> {
  const url =
    `${BASE_URL}/qisserver/rds?state=notenspiegelStudent&next=list.vm&nextdir=qispos/notenspiegel/student&createInfos=Y&struct=auswahlBaum&nodeID=${abschlussId}&expand=0&asi=${asi}#${abschlussId}`;

  const request = new Request(url, {
    method: "GET",
    headers: {
      Cookie: cookie,
    },
  });

  const response = await fetch(request);

  if (response.status !== 200) throw "expected status 200";

  const text = await response.text();

  return text;
}

function sleep(seconds: number): Promise<void> {
  return new Promise((resolve, reject) => setTimeout(resolve, seconds * 1000));
}

async function main() {
  const username = await question("input", "username:");
  if (username === undefined) return;
  const password = await question("password", "password:");
  if (password === undefined) return;

  const cookie = await getCookie(username, password);
  const asi = await getAsi(cookie);
  const abschlussId = await getAbschlussId(cookie, asi);

  let notenSpiegel = await getNotenSpiegelHtml(cookie, asi, abschlussId);

  while (true) {
    console.log(`Lade Notenspiegel: ${new Date().toUTCString()}`);

    const notenSpiegelNew = await getNotenSpiegelHtml(cookie, asi, abschlussId);

    const diff = notenSpiegelNew.length - notenSpiegel.length;
    if (diff > 100) {
      notenSpiegel = notenSpiegelNew;
      console.log("Neue Note!");
    }

    await sleep(69);
  }
}
main();
