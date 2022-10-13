import React from "react";
import ReactDOM from "react-dom/client";

import "./styles/index.css";
import logo from "./img/logo.png";
import botIcon from "./img/bot.png";

const serverLink = "http://localhost:8080";

/**
 * Конструктор объекта сообщения
 *
 * @constructor
 *
 * @param {string} text - текст сообщения (обязательный параметр)
 * @param {string} sender - отправитель = "bot" или "user" (обязательный параметр)
 * @param {boolean} appear - флаг, контролирующий появление вариантов ответов/вопросов,
 * которые предлагает бот
 * @param {array} array - массив опций (вариантов ответов/вопросов, которые предлагает бот)
 * @param {string} link - ссылка на скачивание договора
 */
class MessageObject {
  constructor(text, sender, appear = false, array = [], link = null) {
    this.text = text;
    this.sender = "_" + sender;
    this.options = { appear: appear, array: array };
    this.link = link;
  }
}

const startBlock = new MessageObject(
  "Добро пожаловать! Давайте я покажу вам, с чем могу помочь:",
  "bot",
  true,
  [
    ["Пройти тест на самозанятость", "/selfTest/yes"],
    ["Получить комплект докуметов", "/documents/doc"],
    ["Узнать подробнее про самозанятых", 5],
  ]
);
const continueBlock = JSON.parse(JSON.stringify(startBlock));
continueBlock.text = "Давайте я покажу вам, с чем могу помочь:";

/**
 * Компонент опции (вариант ответа/вопроса, который предлагает бот)
 * @component
 */
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

/**
 * Компонент сообщения (может содержать компонент опции)
 * @component
 */
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

/**
 * Компонент чата (содержит компоненты сообщений)
 * @component
 */
class Chat extends React.Component {
  /**
   * Конструктор компонента чата. Компонент хранит массив отображаемых сообщений.
   * @constructor
   */
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

  /**
   * Отправка и обработка GET-запроса серверу в тесте на самозанятость
   * @method
   * @param {array} messages - массив сообщений в чате
   * @param {string} link - ссылка (относительный путь) для выполнения запроса
   */
  async fetchSETest(messages, link) {
    let newQuestion = "Извините, сервер временно недоступен";

    try {
      let response = await fetch(serverLink + link);

      if (response.ok) {
        newQuestion = await response.json();
        messages.push(
          new MessageObject(
            newQuestion.text,
            "bot",
            newQuestion.question,
            newQuestion.question
              ? [
                  ["Да", "/selfTest/yes"],
                  ["Нет", "/selfTest/no"],
                  ["Назад", "/selfTest/reject"],
                ]
              : []
          )
        );

        if (!newQuestion.question) {
          messages.push(JSON.parse(JSON.stringify(continueBlock)));
        }
      } else {
        messages.push(new MessageObject(newQuestion, "bot"));
        messages.push(JSON.parse(JSON.stringify(continueBlock)));
      }
    } catch (e) {
      messages.push(new MessageObject("Нет подключения к серверу", "bot"));
      messages.push(JSON.parse(JSON.stringify(continueBlock)));
    }
  }

  /**
   * Отправка и обработка GET-запроса серверу в тесте на подбор комплекта документов
   * @method
   * @param {array} messages - массив сообщений в чате
   * @param {string} link - ссылка (относительный путь) для выполнения запроса
   * @param {int} index - индекс варианта ответа (если равен -1, то пользователь возвращается на стартовый блок))
   */
  async fetchDocTest(messages, link, index) {
    if (index === -1) {
      messages.push(JSON.parse(JSON.stringify(continueBlock)));
      return;
    }

    let newQuestion = "Извините, сервер временно недоступен";
    try {
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
            new MessageObject(newQuestion.text, "bot", true, options)
          );
        } else {
          messages.push(
            new MessageObject(
              "Ваш договор:",
              "bot",
              false,
              [],
              "http://localhost:8080/download"
            )
          );
          messages.push(JSON.parse(JSON.stringify(continueBlock)));
        }
      } else {
        messages.push(new MessageObject(newQuestion, "bot"));
        messages.push(JSON.parse(JSON.stringify(continueBlock)));
      }
    } catch (e) {
      messages.push(new MessageObject("Нет подключения к серверу", "bot"));
      messages.push(JSON.parse(JSON.stringify(continueBlock)));
    }
  }

  /**
   * Обработчик события клика (используется при клике на опции(варианты ответов/вопросов, которые предлагает чат-бот))
   * @method
   * @param {object} e - объект события
   * @param {string} link - ссылка (относительный путь) для выполнения запроса
   * @param {int} index - индекс варианта ответа (если равен -1, то пользователь возвращается на стартовый блок))
   */
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

/**
 * Компонент чат-бота (содержит компонент чата)
 * @component
 */
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

/**
 * Компонент страницы (содержит компонент чат-бота)
 * @component
 */
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
