import {
  ChakraProvider,
  Flex,
  Input,
  useDisclosure,
  useBoolean,
  Spacer,
} from "@chakra-ui/react";
import { ChangeEvent, useState } from "react";

import theme from "./theme/theme";

import {
  Button,
  Box,
  HStack,
  Text,
  Heading,
  Stack,
  CloseButton,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

function App() {
  const [listTitle, setListTitle] = useState("");
  const [cardTitle, setCardTitle] = useState("");
  const [lists, setLists] = useState([
    { id: 1, title: "list1", flag: false },
    { id: 2, title: "list2", flag: false },
  ]);

  const [cards, setCards] = useState([
    { id: 1, title: "プロジェクト計画", list_id: 1 },
    { id: 2, title: "TODO2", list_id: 1 },
    { id: 3, title: "TODO3", list_id: 2 },
    { id: 4, title: "TODO4", list_id: 2 },
  ]);

  const [listFlag, setListFlag] = useBoolean();

  const onChangeListTitle = (e: ChangeEvent<HTMLInputElement>) =>
    setListTitle(e.target.value);

  const onChangeCardTitle = (e: ChangeEvent<HTMLInputElement>) =>
    setCardTitle(e.target.value);

  const ToggleFlag = (index: number, bool: boolean) => {
    setLists((prevLists) => {
      const updatedLists = [...prevLists];
      updatedLists[index].flag = bool;
      return updatedLists;
    });
  };

  const onClickCreateList = () => {
    if (listTitle == "") return;
    const newList = { id: lists.length + 1, title: listTitle, flag: false };
    const updatedLists = [...lists, newList];
    setLists(updatedLists);
    setListFlag.off;
    setListTitle("");
  };

  const onClickDeleteList = (index: number) => {
    const updatedLists = [...lists];
    updatedLists.splice(index, 1);
    setLists(updatedLists);
  };

  const onClickCreateCard = (list_id: number) => {
    const newCard = {
      id: cards.length + 1,
      title: cardTitle,
      list_id: list_id,
    };
    const updatedCard = [...cards, newCard];
    setCards(updatedCard);
    ToggleFlag(list_id - 1, false);
    setCardTitle("");
  };

  return (
    <ChakraProvider theme={theme}>
      <HStack spacing="24px" p="2" align="start">
        {lists.map((list, index) => (
          <Box minW="300px" bg="white" borderRadius="lg" key={list.id}>
            <Stack px="4" py="4" spacing="3">
              <Flex align="center">
                <Heading size="md">{list.title}</Heading>
                <Spacer />
                <DeleteIcon
                  opacity={0.6}
                  boxSize={4}
                  _hover={{ opacity: 0.9, cursor: "pointer" }}
                  onClick={() => onClickDeleteList(index)}
                />
              </Flex>
              <Box
                borderRadius="lg"
                shadow="lg"
                p="3"
                _hover={{ shadow: "outline", cursor: "pointer" }}
              >
                <Text>sample1</Text>
              </Box>
              <Box
                borderRadius="lg"
                shadow="lg"
                p="3"
                _hover={{ shadow: "outline", cursor: "pointer" }}
              >
                <Text>sample2</Text>
              </Box>
              {cards
                .filter((card) => card.list_id == list.id)
                .map((filterdCard) => (
                  <Box
                    key={filterdCard.id}
                    borderRadius="lg"
                    shadow="lg"
                    p="3"
                    _hover={{ shadow: "outline", cursor: "pointer" }}
                  >
                    <Text>{filterdCard.title}</Text>
                  </Box>
                ))}

              {list.flag ? (
                <Box mt="1">
                  <Stack>
                    <Input
                      size="sm"
                      borderRadius="lg"
                      shadow="lg"
                      placeholder="カードのタイトルを入力"
                      onChange={onChangeCardTitle}
                      value={cardTitle}
                    />
                    <Flex>
                      <Button
                        colorScheme="blue"
                        size="sm"
                        w="40%"
                        onClick={() => onClickCreateCard(list.id)}
                      >
                        + カードを追加
                      </Button>
                      <CloseButton
                        ml="2"
                        onClick={() => ToggleFlag(index, false)}
                      />
                    </Flex>
                  </Stack>
                </Box>
              ) : (
                <Box mt="1">
                  <Button
                    bg="white"
                    w="70%"
                    onClick={() => ToggleFlag(index, true)}
                  >
                    + カードを追加
                  </Button>
                </Box>
              )}
            </Stack>
          </Box>
        ))}

        {listFlag ? (
          <Box
            mt="1"
            minW="300px"
            bg="white"
            color="white"
            borderRadius="lg"
            p="2"
          >
            <Stack>
              <Input
                size="sm"
                borderRadius="lg"
                shadow="lg"
                placeholder="リストのタイトルを入力"
                color="gray.700"
                value={listTitle}
                onChange={onChangeListTitle}
              />
              <Flex>
                <Button
                  colorScheme="blue"
                  size="sm"
                  w="40%"
                  onClick={onClickCreateList}
                >
                  + リストを追加
                </Button>
                <CloseButton
                  ml="2"
                  color="gray.700"
                  onClick={setListFlag.off}
                />
              </Flex>
            </Stack>
          </Box>
        ) : (
          <Box
            minW="300px"
            bg="gray.300"
            color="white"
            borderRadius="lg"
            p="2"
            _hover={{ cursor: "pointer", backgroundColor: "gray.400" }}
            onClick={setListFlag.on}
          >
            <Text>+ もう1つリストを追加</Text>
          </Box>
        )}
      </HStack>
    </ChakraProvider>
  );
}

export default App;
