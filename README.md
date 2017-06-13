![Logo](admin/hpcontrol.png)
# ioBroker.hpcontrol
=================
## Description
This ioBroker adapter allows to monitor (monitor at the moment, control in the future) heat pumps from Buderus, Alpha Innotec and some others. This adapter is at this moment in a pre alpha release, but it should do his job (some values may be wrong calculated). The adapter populates the following Values:
-	Return temperature (Rücklauf)
-	Underfloor heating temperature (Temperatur der Fußbodenheizung)
-	Counter heat quantity heating (Wärmemenge Heizung)
-	Counter heat quantity hot water (Wärmemenge Brauchwasser)
-	Rate of flow (Durchfluss)
-	Ambient temperature (Außentemperatur)
-	Average ambient temperature (Durchschnittliche Außenemperatur)
-	Actual hot water temperature (IST-Warmwassertemperatur)
-	Set hot water temperature (SOLL-Warmwassertemperatur)
-	Counter working period VD1 (Arbeitsstunden Verdichter 1)
-	Counter working impuls (Impulse Verdichter 1)
-	Working period heating (Arbeitsstunden Heizung)
-	Working period hot water (Arbeitsstunden Warmwasser)

The configuration consists of the IP of the heat pump and the port (usually 8888 or 8889).

## Changelog

#### 0.2.0
* (jachik) initial release

## License
The MIT License (MIT)

Copyright (c) 2017 Jacek Schikora <js@j-s-edv.de>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
