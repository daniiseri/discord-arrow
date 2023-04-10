import { Box, Text, TextField, Image, Button } from "@skynexui/components";
import { useEffect, useState } from "react";
import appConfig from "../config.json";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import { ButtonSendSticker } from "../src/components/ButtonSendSticker";
import { AiOutlineSend } from "react-icons/ai";

const SUPABASE_URL = "https://fucyekeibwaoniehqkii.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1Y3lla2VpYndhb25pZWhxa2lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODA5OTYyOTIsImV4cCI6MTk5NjU3MjI5Mn0.d-ceEiVpzkqVP1f81OJziM9XbPdiPxIEVaGxmRBiCeE";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function listenToInserts(setMessageList) {
  return supabase
    .channel("any")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "message" },
      (payload) => {
        setMessageList(payload.new);
      }
    )
    .subscribe();
}

function listenToDeletes(setMessageList) {
  return supabase
    .channel("any")
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "message" },
      (payload) => {
        setMessageList(payload.old.id);
      }
    )
    .subscribe();
}

export default function ChatPage() {
  // Sua lógica vai aqui
  const route = useRouter();
  const loggedUser = route.query.username || "STRANGER";
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  useEffect(() => {
    supabase
      .from("message")
      .select("*")
      .order("id", { ascending: false })
      .then((response) => {
        setMessageList(response.data);
      });

    listenToInserts((newMessage) => {
      setMessageList((prevState) => [newMessage, ...prevState]);
    });

    listenToDeletes((oldMessage) => {
      setMessageList((prevState) => {
        return prevState.filter((data) => data.id !== oldMessage);
      });
    });
  }, []);

  // ./Sua lógica vai aqui
  function handleNewMessage(newMessage) {
    const info = {
      text: newMessage,
      from: loggedUser,
    };

    supabase
      .from("message")
      .insert([info])
      .then(() => {});

    setMessage("");
  }

  return (
    <Box
      styleSheet={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: appConfig.theme.colors.primary[500],
        backgroundImage: `url(https://images5.alphacoders.com/828/828615.jpg)`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundBlendMode: "multiply",
        color: appConfig.theme.colors.neutrals["000"],
      }}
    >
      <Box
        styleSheet={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          boxShadow: "0 2px 10px 0 rgb(0 0 0 / 20%)",
          borderRadius: "5px",
          backgroundColor: appConfig.theme.colors.neutrals[700],
          height: "100%",
          maxWidth: "95%",
          maxHeight: "95vh",
          padding: "32px",
        }}
      >
        <Header />
        <Box
          styleSheet={{
            position: "relative",
            display: "flex",
            flex: 1,
            height: "80%",
            backgroundColor: appConfig.theme.colors.neutrals[600],
            flexDirection: "column",
            borderRadius: "5px",
            padding: "16px",
          }}
        >
          {messageList.length === 0 && (
            <Box styleSheet={{ textAlign: "center" }}>Loading...</Box>
          )}
          <MessageList messages={messageList} setMessages={setMessageList} />

          <Box
            as="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleNewMessage(message);
            }}
            styleSheet={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <TextField
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleNewMessage(message);
                }
              }}
              placeholder="Insira sua mensagem aqui..."
              type="textarea"
              styleSheet={{
                width: "100%",
                border: "0",
                resize: "none",
                borderRadius: "5px",
                padding: "6px 8px",
                backgroundColor: appConfig.theme.colors.neutrals[800],
                marginRight: "12px",
                color: appConfig.theme.colors.neutrals[200],
              }}
            />
            <ButtonSendSticker
              onStickerClick={(sticker) => {
                handleNewMessage(":sticker:" + sticker);
              }}
            />
            <Button
              styleSheet={{
                borderRadius: "50%",
                padding: "0 3px 0 0",
                minWidth: "50px",
                minHeight: "50px",
                fontSize: "20px",
                marginBottom: "8px",
                lineHeight: "0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              colorVariant="light"
              type="submit"
              label={<AiOutlineSend />}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function Header() {
  return (
    <>
      <Box
        styleSheet={{
          width: "100%",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text variant="heading5">Chat</Text>
        <Button
          variant="tertiary"
          colorVariant="neutral"
          label="Logout"
          href="/"
        />
      </Box>
    </>
  );
}

function MessageList(props) {
  return (
    <Box
      tag="ul"
      styleSheet={{
        overflow: "scroll",
        display: "flex",
        flexDirection: "column-reverse",
        flex: 1,
        color: appConfig.theme.colors.neutrals["000"],
        marginBottom: "16px",
      }}
    >
      {props.messages.map((message) => {
        return (
          <Text
            key={message?.id}
            tag="li"
            styleSheet={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderRadius: "5px",
              padding: "6px",
              marginBottom: "12px",
              hover: {
                backgroundColor: appConfig.theme.colors.neutrals[700],
              },
            }}
          >
            <Box
              styleSheet={{
                marginBottom: "8px",
              }}
            >
              <Image
                styleSheet={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  display: "inline-block",
                  marginRight: "8px",
                }}
                src={`https://github.com/${message?.from}.png`}
              />
              <Text tag="strong">{message?.from}</Text>
              <Text
                styleSheet={{
                  fontSize: "10px",
                  marginLeft: "8px",
                  color: appConfig.theme.colors.neutrals[300],
                }}
                tag="span"
              >
                {new Date().toLocaleDateString()}
              </Text>
              {message.text.startsWith(":sticker:") ? (
                <Image src={message.text.replace(":sticker:", "")} />
              ) : (
                message.text
              )}
            </Box>
            <Text
              onMouseEnter={() => {}}
              onClick={() => {
                supabase
                  .from("message")
                  .delete()
                  .eq("id", message.id)
                  .then(() => {});
              }}
            >
              Remover
            </Text>
          </Text>
        );
      })}
    </Box>
  );
}
