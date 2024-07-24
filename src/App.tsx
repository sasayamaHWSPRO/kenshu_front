import {
  ChakraProvider,
  Flex,
  Input,
  useBoolean,
  Spacer,
  Button,
  Box,
  HStack,
  Text,
  Heading,
  Stack,
  CloseButton,
} from "@chakra-ui/react";
import { ChangeEvent, useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import theme from "./theme/theme";
import { DeleteIcon } from "@chakra-ui/icons";
import axios from "axios";

type List = {
  id: number;
  title: string;
  flag: boolean;
  cards: Card[];
};

type Card = { id: number; title: string; list_id: number };

/* 並び替え, 同ブロック */
const reorder = (list: List, startIndex: number, endIndex: number) => {
  const removed = list.cards.splice(startIndex, 1);
  list.cards.splice(endIndex, 0, removed[0]);
};

/* 並び替え, 異ブロック */
const move = (
  sourceList: List,
  destinationList: List,
  startIndex: number,
  endIndex: number
) => {
  // const removeDestination: Card = destinationList.cards.pop()!!;
  const [removeSource] = sourceList.cards.splice(startIndex, 1);
  destinationList.cards.splice(endIndex, 0, removeSource);
  // sourceList.cards.unshift(removeDestination);
};

function App() {
  const [loading, setLoading] = useState(false);
  const [listTitle, setListTitle] = useState("");
  const [cardTitle, setCardTitle] = useState("");
  const [lists, setLists] = useState<List[]>([
    // プレースホルダー
    // { id: 1, title: "list1", flag: false },
    // { id: 2, title: "list2", flag: false },
  ]);

  // const [cards, setCards] = useState<Card[]>([
  //   // { id: 1, title: "プロジェクト計画", list_id: 1 },
  //   // { id: 2, title: "TODO2", list_id: 1 },
  //   // { id: 3, title: "TODO3", list_id: 2 },
  //   // { id: 4, title: "TODO4", list_id: 2 },
  // ]);

  const [listFlag, setListFlag] = useBoolean();

  const onChangeListTitle = (e: ChangeEvent<HTMLInputElement>) =>
    setListTitle(e.target.value);

  const onChangeCardTitle = (e: ChangeEvent<HTMLInputElement>) =>
    setCardTitle(e.target.value);

  const ToggleFlag = (list_id: number, flag: boolean) => {
    setLists((prevLists) => {
      const updatedLists = [...prevLists];
      const index = updatedLists.findIndex((list) => list.id == list_id);
      updatedLists[index].flag = flag;
      return updatedLists;
    });
  };

  useEffect(() => {
    axios
      .all([
        axios.get("http://localhost:8000/lists"),
        axios.get("http://localhost:8000/cards"),
      ])
      .then(
        axios.spread((firstResponse, secondResponse) => {
          const updatedLists = firstResponse.data.map(
            (list: { id: number; title: string; list_order: number }): List => {
              return { id: list.id, title: list.title, flag: false, cards: [] };
            }
          );
          const updatedCards = secondResponse.data.map((card: Card) => {
            return { id: card.id, title: card.title, list_id: card.list_id };
          });
          updatedLists.forEach((list: List) => {
            updatedCards.forEach((card: Card) => {
              if (list.id == card.list_id) {
                list.cards.push(card);
              }
            });
          });
          console.log(updatedLists);

          setLists(updatedLists);
        })
      )
      .catch((error) => console.log(error));
  }, [loading]);

  // list作成テスト
  // const onClickCreateList = () => {
  //   if (listTitle == "") return;
  //   const newList = { id: lists.length + 1, title: listTitle, flag: false };
  //   const updatedLists = [...lists, newList];
  //   setLists(updatedLists);
  //   setListFlag.off;
  //   setListTitle("");
  // };

  // list作成
  const createList = () => {
    setLoading(true);
    axios
      .post("http://localhost:8000/lists", {
        title: listTitle,
        list_order: 2,
      })
      .then(() => {
        // console.log(res);
        // const newList = { id: res.data.id, title: res.data.title, flag: false };
        // const updatedLists = [...lists, newList];
        // setLists(updatedLists);
        setListFlag.off;
        setListTitle("");
        setLoading(false);
      });
  };

  // list削除
  const deleteList = (list_id: number) => {
    setLoading(true);
    axios
      .delete(`http://localhost:8000/lists/${list_id}`)
      .then(() => setLoading(false));
  };
  // リスト削除テスト
  // const onClickDeleteList = (index: number) => {
  //   const updatedLists = [...lists];
  //   updatedLists.splice(index, 1);
  //   setLists(updatedLists);
  // };

  // カード作成テスト
  // const onClickCreateCard = (list_id: number) => {
  //   const newCard = {
  //     id: cards.length + 1,
  //     title: cardTitle,
  //     list_id: list_id,
  //   };
  //   const updatedCard = [...cards, newCard];
  //   setCards(updatedCard);
  //   ToggleFlag(list_id - 1, false);
  //   setCardTitle("");
  // };

  const createCard = (list_id: number) => {
    setLoading(true);
    axios
      .post("http://localhost:8000/cards", {
        title: cardTitle,
        card_order: 1,
        list_id: list_id,
      })
      .then(() => {
        setCardTitle("");
        ToggleFlag(list_id, false);
        setLoading(false);
      });
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    console.log(result);

    if (!destination) {
      return;
    }

    const start = lists.findIndex(
      (list) => list.id == parseInt(source.droppableId)
    );
    const end = lists.findIndex(
      (list) => list.id == parseInt(destination.droppableId)
    );

    if (source.droppableId === destination.droppableId) {
      reorder(lists[start], source.index, destination.index);
    } else {
      move(lists[start], lists[end], source.index, destination.index);
    }
  };

  return (
    <ChakraProvider theme={theme}>
      <DragDropContext onDragEnd={onDragEnd}>
        <HStack spacing="24px" p="2" align="start">
          {lists.map((list, index) => (
            <Droppable droppableId={list.id.toString()} key={list.id}>
              {(provided) => (
                <Box
                  minW="300px"
                  bg="white"
                  borderRadius="lg"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  <Stack px="4" py="4" spacing="3">
                    <Flex align="center">
                      <Heading size="md">{list.title}</Heading>
                      <Spacer />
                      <DeleteIcon
                        opacity={0.6}
                        boxSize={4}
                        _hover={{ opacity: 0.9, cursor: "pointer" }}
                        onClick={() => deleteList(list.id)}
                      />
                    </Flex>

                    {list.cards.map((card, index) => (
                      <Draggable
                        key={card.id}
                        draggableId={card.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.dragHandleProps}
                            {...provided.draggableProps}
                            borderRadius="lg"
                            shadow="lg"
                            p="3"
                            _hover={{ shadow: "outline", cursor: "pointer" }}
                          >
                            <Text>{card.title}</Text>
                          </Box>
                        )}
                      </Draggable>
                    ))}

                    {provided.placeholder}

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
                              onClick={() => createCard(list.id)}
                            >
                              + カードを追加
                            </Button>
                            <CloseButton
                              ml="2"
                              onClick={() => ToggleFlag(list.id, false)}
                            />
                          </Flex>
                        </Stack>
                      </Box>
                    ) : (
                      <Box mt="1">
                        <Button
                          bg="white"
                          w="70%"
                          onClick={() => ToggleFlag(list.id, true)}
                        >
                          + カードを追加
                        </Button>
                      </Box>
                    )}
                  </Stack>
                </Box>
              )}
            </Droppable>
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
                    onClick={createList}
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
      </DragDropContext>
    </ChakraProvider>
  );
}

export default App;
