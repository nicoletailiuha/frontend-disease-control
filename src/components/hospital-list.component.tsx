import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardText,
  CardTitle,
  Col,
  Container,
  ListGroup,
  ListGroupItem,
  Row,
} from "reactstrap";
import { getHospitalsLive, getTags } from "../actions/DataActions";
import { selectHospitals, selectTagColors, selectTags } from "../reducers/Combiner";
import * as T from "../resources/types";
import { Tags } from "../shared/tags.component";

export function HospitalList() {
  const hospitals = useSelector(selectHospitals);
  const tags = useSelector(selectTags);
  const tagColors = useSelector(selectTagColors);
  const dispatch = useDispatch();

  const [selectedTags, setSelectedTags] = useState<T.Tag[]>([]);
  const [filteredData, setFilteredData] = useState<T.Hospital[]>([]);

  useEffect(() => {
    dispatch(getHospitalsLive());
    dispatch(getTags());
  }, [dispatch]);

  useEffect(() => {
    setFilteredData(hospitals);
  }, [hospitals]);

  const handleTagClick = useCallback(
    (tag: T.Tag) => {
      let newSelectedTags = selectedTags;
      if (selectedTags.includes(tag)) {
        newSelectedTags = newSelectedTags.filter((t) => t.id !== tag.id);
      } else {
        newSelectedTags.push(tag);
      }

      const selectedTagIds = newSelectedTags.map((t) => t.id);
      let newFilteredData;
      if (selectedTagIds.length) {
        newFilteredData = hospitals.filter((d) => selectedTagIds.every((id) => d.tags.map((t) => t.id).includes(id)));
      } else {
        newFilteredData = hospitals;
      }

      setSelectedTags(newSelectedTags);
      setFilteredData(newFilteredData);
    },
    [selectedTags, hospitals]
  );

  return (
    <Container className="my-3">
      <div className="mb-2">
        {tags.map((t) => {
          const isSelected = selectedTags.includes(t);
          return (
            <Button
              key={t.id}
              outline
              color={tagColors[t.id]}
              active={isSelected}
              className="mr-1 mb-1"
              onClick={() => handleTagClick(t)}
            >
              {t.description}
            </Button>
          );
        })}
      </div>
      <Row>
        {filteredData.map((d) => {
          return (
            <Col key={d.id} xs="12" sm="6" md="6" lg="3" className="mb-4">
              <Card className="h-100">
                <CardBody>
                  <CardTitle tag="h4">
                    {d.canManage ? <Link to={`/details/${d.id}`}>{truncate(d.name, 50)}</Link> : truncate(d.name, 50)}
                  </CardTitle>
                  <CardText>{d.description}</CardText>
                  <Tags data={d.tags} />
                </CardBody>
                <ListGroup flush className="mt-auto">
                  {d.inventory.map((p) => {
                    const inventUpdatedAt = new Date(p.HospitalInventory.updatedAt);
                    return (
                      <ListGroupItem key={p.id}>
                        <Badge
                          color="warning"
                          className="border border-info d-flex justify-content-between align-items-center"
                        >
                          <span className="text-uppercase">{p.name}</span>

                          <small className="text-truncate mx-2 text-muted" title={inventUpdatedAt.toLocaleString()}>
                            {inventUpdatedAt.toLocaleString()}
                          </small>
                          <Badge pill>{p.HospitalInventory.quantity}</Badge>
                        </Badge>
                      </ListGroupItem>
                    );
                  })}
                </ListGroup>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
}

function truncate(text: string = "", sliceAt = 15) {
  return text.length > sliceAt ? `${text.slice(0, sliceAt)}...` : text;
}
