import React from "react";
import ReactDOM from "react-dom/client";

import "./styles/index.css";
import logo from "./img/logo.png";
import botIcon from "./img/bot.png";

const serverLink = "http://localhost:8080";

class MessageObject {
  constructor(
    text,
    sender,
    options = { appear: false, array: [] },
    link = null
  ) {
    this.text = text;
    this.sender = "_" + sender;
    this.options = options;
    this.link = link;
  }
}

const startBlock = new MessageObject(
  "Добро пожаловать! Давайте я покажу вам, с чем могу помочь:",
  "bot",
  {
    appear: true,
    array: [
      ["Пройти тест на самозанятость", "/selfTest/yes"],
      ["Получить комплект докуметов", "/documents/doc"],
      ["Узнать подробнее про самозанятых", 5],
    ],
  }
);
const continueBlock = JSON.parse(JSON.stringify(startBlock));
continueBlock.text = "Давайте я покажу вам, с чем могу помочь:";

class Option extends React.Component {
  render() {
    return (
      <div
        className="option"
        onClick={(e) => {
          this.props.onClick(e);
        }}
      >
        {this.props.text}
      </div>
    );
  }
}

class Message extends React.Component {
  render() {
    const options = this.props.options;

    let element = null;
    if (options.appear) {
      element = (
        <div className="option-container">
          {options.array.map((text, index, array) => (
            <Option
              key={index}
              text={text[0]}
              onClick={(e) => {
                this.props.onClick(
                  e,
                  text[1],
                  index === array.length - 1 ? -1 : index
                );
              }}
            />
          ))}
        </div>
      );
    }

    let link = null;
    if (this.props.link) {
      link = (
        <a href={this.props.link} className="message__link">
          Скачать
        </a>
      );
    }

    return (
      <div className={"message-container " + this.props.position}>
        <div className="message">
          {this.props.text}
          <br />
          {link}
        </div>
        {element}
      </div>
    );
  }
}

class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [JSON.parse(JSON.stringify(startBlock))],
    };
  }

  render() {
    const messages = this.state.messages;

    return (
      <div className="chat-wrapper">
        {messages.map((m, index) => (
          <Message
            key={index}
            text={m.text}
            position={m.sender}
            options={m.options}
            link={m.link}
            onClick={(e, link, index) => {
              this.handleClick(e, link, index);
            }}
          />
        ))}
      </div>
    );
  }

  async fetchSETest(messages, link) {
    let newQuestion = "Извините, сервер временно недоступен";
    let response = await fetch(serverLink + link);

    if (response.ok) {
      newQuestion = await response.json();
      messages.push(
        new MessageObject(newQuestion.text, "bot", {
          appear: newQuestion.question,
          array: newQuestion.question
            ? [
                ["Да", "/selfTest/yes"],
                ["Нет", "/selfTest/no"],
                ["Назад", "/selfTest/reject"],
              ]
            : [],
        })
      );

      if (!newQuestion.question) {
        messages.push(JSON.parse(JSON.stringify(continueBlock)));
      }
    } else {
      messages.push(new MessageObject(newQuestion, "bot"));
      messages.push(JSON.parse(JSON.stringify(continueBlock)));
    }
  }

  async fetchDocTest(messages, link, index) {
    if (index === -1) {
      messages.push(JSON.parse(JSON.stringify(continueBlock)));
      return;
    }
    let newQuestion = "Извините, сервер временно недоступен";
    let response = await fetch(
      serverLink + link + "?" + new URLSearchParams({ bodyNumber: index })
    );
    if (response.ok) {
      newQuestion = await response.json();
      if (newQuestion.text !== "/download") {
        let options = newQuestion.answers.map((text) => [
          text,
          "/documents/doc",
        ]);
        messages.push(
          new MessageObject(newQuestion.text, "bot", {
            appear: true,
            array: options,
          })
        );
      } else {
        messages.push(
          new MessageObject(
            "Ваш договор:",
            "bot",
            { appear: false, array: [] },
            "http://localhost:8080/download"
          )
        );
        messages.push(JSON.parse(JSON.stringify(continueBlock)));
      }
    } else {
      messages.push(new MessageObject(newQuestion, "bot"));
      messages.push(JSON.parse(JSON.stringify(continueBlock)));
    }
  }

  async handleClick(e, link, index) {
    const messages = this.state.messages;

    let messageOptions = messages[messages.length - 1].options;

    messageOptions.appear = false;
    messageOptions.array = [];

    messages.push(new MessageObject(e.target.textContent, "user"));

    if (link.includes("selfTest")) {
      await this.fetchSETest(messages, link);
    } else {
      await this.fetchDocTest(messages, link, index);
    }

    this.setState({ messages: messages });

    setTimeout(() => {
      let element = document.querySelector(".chat-wrapper");
      element.scrollTop = element.scrollHeight;
    }, 0);
  }
}

class ChatBot extends React.Component {
  render() {
    return (
      <div className="chatbot">
        <img className="chatbot__icon" src={botIcon} alt="chat-bot-icon" />
        <Chat />
      </div>
    );
  }
}

class Page extends React.Component {
  render() {
    return (
      <div className="page">
        <div className="logo">
          <img className="logo__img" src={logo} alt="logo" />
        </div>
        <ChatBot />
      </div>
    );
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Page />);
