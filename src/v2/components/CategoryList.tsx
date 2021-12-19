import * as React from "react";
import { List } from "semantic-ui-react";
import { selectPuzzleCategories } from "../features/puzzles/puzzleSlice";
import { useAppSelector } from "../hooks";

export default function CategoryList() {
  const categories = useAppSelector(selectPuzzleCategories);
  return (
    <List divided relaxed>
      {categories.map((category) => (
        <List.Item key={category.name}>
          <List.Icon name="folder"></List.Icon>
          <List.Content>
            <List.Header as="a">{category.name}</List.Header>
            <List.Description>
              {category.puzzles.length} puzzles
            </List.Description>
          </List.Content>
          <List.List>
            {category.puzzles.map(({ puzzle }) => (
              <List.Item key={puzzle.name}>
                <List.Icon name="puzzle"></List.Icon>
                <List.Content>
                  <List.Header as="a">{puzzle.name}</List.Header>
                  <List.Description>
                    {puzzle.width} x {puzzle.height}
                  </List.Description>
                </List.Content>
              </List.Item>
            ))}
          </List.List>
        </List.Item>
      ))}
    </List>
  );
}
