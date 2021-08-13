# hsrm-qis

## Usage

```js
deno run --unstable --allow-net="wwwqis-2rz.itmz.hs-rm.de" https://raw.githubusercontent.com/Cazka/hsrm-qis/main/main.ts
```
You will then be prompted to enter your QIS login credentials.
![image](https://user-images.githubusercontent.com/30176357/129283321-aef16adf-8f1f-4bcc-9ee0-45fea7a88d8b.png)

The program will then fetch your grades continously and notify you by logging `Neue Note!` in the console when it found a new grade.
![image](https://user-images.githubusercontent.com/30176357/129283842-a0741835-5314-4b28-8537-5ae12ddf1e87.png)
