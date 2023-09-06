import React, { useEffect, useState } from "react";
import { Dropdown, Input } from "semantic-ui-react";
import countries from "./words";
import "./styles.css";

const acceptedCountries = [
  "AUD",
  "BGN",
  "BRL",
  "CAD",
  "CHF",
  "CNY",
  "CZK",
  "DKK",
  "EUR",
  "GBP",
  "HKD",
  "HUF",
  "IDR",
  "ILS",
  "INR",
  "ISK",
  "JPY",
  "KRW",
  "MXN",
  "MYR",
  "NOK",
  "NZD",
  "PHP",
  "PLN",
  "RON",
  "SEK",
  "SGD",
  "THB",
  "TRY",
  "ZAR",
  "USD"
];

const defaultFromCounty = "United States Dollar";
const defaultToCountry = "Euro";

export default function App() {
  const [countrieList, setCountrieList] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [fromCountry, setFromCountry] = useState(defaultFromCounty);
  const [toCountry, setToCountry] = useState(defaultToCountry);
  const [result, setResult] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCountrieList(() => {
      return countries
        .map((country) => {
          return {
            key: country.name,
            text: country.code + " - " + country.name,
            value: country.name,
            image: country.flag,
            symbol: country.symbol,
            code: country.code
          };
        })
        .filter((el) => {
          return acceptedCountries.includes(el.code);
        });
    });
  }, []);

  function handleExchange() {
    setFromCountry(toCountry);
    setToCountry(fromCountry);
  }

  function handleInputCahnge(event, data) {
    setInputValue(data.value);
  }

  function handleFromCounteyChange(event, data) {
    setFromCountry(data.value);
  }

  function handleToCounteyChange(event, data) {
    setToCountry(data.value);
  }

  const fromOBJ = countrieList.find((el) => {
    return el.value === fromCountry;
  });

  const toOBJ = countrieList.find((el) => {
    return el.value === toCountry;
  });

  useEffect(() => {
    const controller = new AbortController();
    (async function logMovies() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.frankfurter.app/latest?amount=${inputValue}&from=${fromOBJ?.code}&to=${toOBJ?.code}, { signal: controller.signal }`
        );
        const data = await response.json();
        setResult(data);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    })();

    return () => {
      controller.abort();
    };
  }, [inputValue, fromCountry, toCountry]);

  return (
    <div className="App">
      <Main>
        <InputsContainer>
          <InputWrapper text={"Amount"}>
            {isLoading ? (
              <Input
                loading
                label={{ basic: true, content: `${fromOBJ?.symbol}` }}
                iconPosition="right"
                placeholder="Write a number..."
                onChange={handleInputCahnge}
              />
            ) : (
              <Input
                label={{ basic: true, content: `${fromOBJ?.symbol}` }}
                iconPosition="right"
                placeholder="Write a number..."
                onChange={handleInputCahnge}
              />
            )}
            {!inputValue && (
              <span
                style={{ color: "orange" }}
                className="summary-text information-text"
              >
                Enter a amount to calculate the currency
              </span>
            )}
          </InputWrapper>
          <InputWrapper text={"From"}>
            <Dropdown
              placeholder="Select word"
              fluid
              search
              selection
              options={countrieList}
              default={10}
              defaultValue={defaultFromCounty}
              value={fromCountry}
              onChange={handleFromCounteyChange}
            />
          </InputWrapper>
          <ButtonWrapper onCLick={handleExchange} />
          <InputWrapper text={"To"}>
            <Dropdown
              placeholder={`Select country`}
              fluid
              search
              selection
              options={countrieList}
              defaultValue={defaultToCountry}
              value={toCountry}
              onChange={handleToCounteyChange}
            />
          </InputWrapper>
        </InputsContainer>
        <Summary
          inputValue={inputValue}
          fromCountry={fromCountry}
          toCountry={toCountry}
          result={result}
          fromOBJ={fromOBJ}
          toOBJ={toOBJ}
        />
        <Footer
          text={
            result?.date &&
            `${fromCountry} to ${toCountry} conversion — Last updated ${result.date}`
          }
        />
      </Main>
    </div>
  );
}

function Main({ children }) {
  return <div className="main">{children}</div>;
}

function InputsContainer({ children }) {
  return <div className="inputs-wrapper">{children}</div>;
}

function InputWrapper({ text, children }) {
  return (
    <div className="input-wrapper">
      <span className="label">{text}</span>
      {children}
    </div>
  );
}

function ButtonWrapper({ onCLick }) {
  return (
    <div className="button-wrapper">
      <button className="exchange" onClick={onCLick}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 17 17"
          aria-hidden="true"
          className="exchange-svg"
        >
          <path
            fill="currentColor"
            fill-rule="evenodd"
            d="M11.726 1.273l2.387 2.394H.667V5h13.446l-2.386 2.393.94.94 4-4-4-4-.94.94zM.666 12.333l4 4 .94-.94L3.22 13h13.447v-1.333H3.22l2.386-2.394-.94-.94-4 4z"
            clip-rule="evenodd"
          ></path>
        </svg>
      </button>
    </div>
  );
}

function Summary({
  inputValue,
  fromCountry,
  toCountry,
  result,
  fromOBJ,
  toOBJ
}) {
  let rates = null;
  if (result?.base) {
    rates = result.rates[Object.keys(result.rates)[0]];
  }

  if (!result?.base || !inputValue) {
    return;
  }

  function separateNumber(number) {
    console.log(number);
    const stringNumber = number.toString();
    if (!stringNumber.includes(".")) return [number, null, null];

    const [mainNumber, pointNumber] = stringNumber.split(".");
    const firstPoint = pointNumber.slice(0, 2);
    const secondPoint = pointNumber.slice(2, -1);

    return [mainNumber, firstPoint, secondPoint];
  }

  return (
    <div className="summary">
      <span className="summary-text input-text">
        {inputValue + " " + fromCountry + " ="}
      </span>
      <span className="summary-text result-text">
        {separateNumber(rates) &&
          separateNumber(rates)[0] &&
          separateNumber(rates)[0]}
        {separateNumber(rates) && separateNumber(rates)[1] && "."}
        {separateNumber(rates) &&
          separateNumber(rates)[1] &&
          separateNumber(rates)[1]}
        <span class="faded-digits">
          {separateNumber(rates) &&
            separateNumber(rates)[2] &&
            separateNumber(rates)[2]}
        </span>{" "}
        {toCountry}
      </span>
      <span className="summary-text currency-one">{`1 ${fromCountry} = ${
        Number(rates) / Number(inputValue)
      } ${toCountry}`}</span>
      <span className="summary-text currency-two">{`1 ${toCountry} = ${
        Number(inputValue) / Number(rates)
      } ${fromCountry}`}</span>
    </div>
  );
}

function Footer({ text }) {
  const attantionMessage = `The Free version of thhis API won't provide all the country information`;

  return (
    <footer>
      <div className="content">
        {text && (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 16 16"
              aria-hidden="true"
              style={{
                color: "rgb(92, 102, 123)",
                width: "16px",
                height: "16px",
                marginLeft: "4px"
              }}
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M8.571 11.429V6.286H6.286v1.143h1.143v4H5.714v1.142h4.572V11.43H8.57zM8 2.857a.857.857 0 100 1.714.857.857 0 000-1.714zM8 16A8 8 0 118 0a8 8 0 010 16zM8 1.143a6.857 6.857 0 100 13.714A6.857 6.857 0 008 1.143z"
                clipRule="evenodd"
              />
            </svg>
            <span>{text}</span>
          </>
        )}

        <span style={{ color: "green", width: "100%" }}>
          {attantionMessage}
        </span>
      </div>
    </footer>
  );
}
