import React from "react";
import ReactDOM from "react-dom/client";

// import "./styles_v1/index.css";
// import logo from "./img_v1/logo.png";
// import botIcon from "./img_v1/bot.png";

import "./styles_v2/index.css";
import logo from "./img_v2/logo.png";
import botIcon from "./img_v2/bot.png";

class Message extends React.Component {
  render() {
    let element = null;
    const options = this.props.options;

    if (options.appear && this.props.position === "_bot") {
      if (options.category === "_text-option") {
        element = (
          <div className="option-container">
            {options.array.map((text, index) => (
              <Option
                key={index}
                option={options.category}
                text={text[0]}
                next={[text[1]]}
                onClick={(e) => {
                  this.props.onClick(e, text[1]);
                }}
              />
            ))}
          </div>
        );
      } else {
        element = (
          <div className="option-container">
            <Option
              option="_yes-option"
              text="Да"
              onClick={(e) => {
                this.props.onClick(e);
              }}
            />
            <Option
              option="_no-option"
              text="Нет"
              onClick={(e) => {
                this.props.onClick(e);
              }}
            />
          </div>
        );
      }
    }

    return (
      <div className={"message-container " + this.props.position}>
        <div className="message">{this.props.text}</div>
        {element}
      </div>
    );
  }
}

class Option extends React.Component {
  render() {
    return (
      <div
        className={"option " + this.props.option}
        onClick={(e) => {
          this.props.onClick(e);
        }}
      >
        {this.props.text}
      </div>
    );
  }
}

class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [
        {
          text: "Добро пожаловать! Давайте я покажу вам, с чем могу помочь:",
          sender: "_bot",
          options: {
            appear: true,
            category: "_text-option",
            array: [
              ["Пройти тест на самозанятость", 5],
              ["Получить комплект докуметов", 1],
              ["Узнать подробнее про самозанятых", 5],
            ],
          },
        },
        // {
        //   text: "Вопрос теста:...?",
        //   sender: "_bot",
        //   options: {
        //     appear: true,
        //     category: "_test-option",
        //     array: [],
        //   },
        // },
      ],
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
            onClick={(e, i) => {
              this.handleClick(e, i);
            }}
          />
        ))}
      </div>
    );
  }

  handleClick(e, index) {
    const messages = this.state.messages;

    let messageOptions = messages[messages.length - 1].options;

    messageOptions.appear = false;
    messageOptions.category = "";
    messageOptions.array = [];

    messages.push({
      text: e.target.textContent,
      sender: "_user",
      options: {
        appear: false,
        category: "",
        array: [],
      },
    });

    let obj = JSON.parse(JSON.stringify(test[index]));
    messages.push(obj);

    this.setState({ messages: messages });

    setTimeout(() => {
      let element = document.querySelector(".chat-wrapper");
      element.scrollTop = element.scrollHeight;
    }, 0);
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
        <div className="block"></div>
        <div className="footer-img"></div>
      </div>
    );
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

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Page />);

let test = [
  {
    text: "Добро пожаловать! Давайте я покажу вам, с чем могу помочь:",
    sender: "_bot",
    options: {
      appear: true,
      category: "_text-option",
      array: [
        ["Пройти тест на самозанятость", 5],
        ["Получить комплект докуметов", 1],
        ["Узнать подробнее про самозанятых", 5],
      ],
    },
  },
  {
    text: "Что вы хотите делать?",
    sender: "_bot",
    options: {
      appear: true,
      category: "_text-option",
      array: [
        ["Сдавать свой автомобиль в аренду", 2],
        ["Ремонтировать автомобиль", 5],
        ["Работать таксистом", 5],
        ["Назад", 0],
      ],
    },
  },
  {
    text: "Вы собираетесь возить арендатора на вашем автомобиле?",
    sender: "_bot",
    options: {
      appear: true,
      category: "_text-option",
      array: [
        ["Нет", 3],
        ["Да", 5],
        ["Назад", 1],
      ],
    },
  },
  {
    text: "Кто вы?",
    sender: "_bot",
    options: {
      appear: true,
      category: "_text-option",
      array: [
        ["Самозанятый без статуса ИП", 4],
        ["Самозанятый со статусом ИП", 4],
        ["Назад", 2],
      ],
    },
  },
  {
    text: "Тут будет ссылка на договор",
    sender: "_bot",
    options: {
      appear: true,
      category: "_text-option",
      array: [["Вернуться на стартовый блок", 0]],
    },
  },
  {
    text: "Тут будет переход к другому тесту",
    sender: "_bot",
    options: {
      appear: true,
      category: "_text-option",
      array: [["Вернуться на стартовый блок", 0]],
    },
  },
];
