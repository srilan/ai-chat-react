import React, { useEffect, useState } from 'react';
import { Box, Button, Container, Form, Heading, Notification, Section, Table, Tile } from 'react-bulma-components';
import Chat from '../../components/chat';

interface TestInterface {
  _id: string,
  input: string,
  score: number
}
interface SettingsInterface {
  enableEmbedding: boolean,
  minimumScore: number
}

function Manage() {
  const endPoint = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const [loadingEmbedding, setLoadingEmbedding] = useState(false);
  const [loadingTest, setLoadingTest] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [document, setDocument] = useState("");
  const [testDocument, setTestDocument] = useState("");
  const [embeddingNotification, setEmbeddingNotification] = useState<any>(<></>);
  const [settingsData, setSettingsData] = useState<SettingsInterface>({
    enableEmbedding: false,
    minimumScore: 90,
  });
  const [createEmbeddingSuccess, setCreateEmbeddingSuccess] = useState(false);
  const [testResults, setTestResults] = useState<Array<TestInterface>>([]);

  const handleCreateEmbeddings = () => {
    setCreateEmbeddingSuccess(false);
    setLoadingEmbedding(true);
    fetch(`${endPoint}/createEmbedding`, {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        input: document,
      })
    }).then(()=> {
      setDocument("");
      setEmbeddingNotification(
        <Notification color="success">
          Embedding Created
      </Notification>
      );
      setCreateEmbeddingSuccess(true);
    }).finally(()=> {
      setLoadingEmbedding(false);
    })
  }
  const handleSaveSettings = () => {
    setLoadingSave(true);
    fetch(`${endPoint}/saveSettings`, {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        settingsData: settingsData,
      })
    }).then((res)=> {
      return res.json()
    }).then((res)=> {
      setTestResults(res.related);
    }).finally(()=> {
      setLoadingSave(false);
    })
  }

  const getSettings = () => {
    setLoadingSave(true);
    fetch(`${endPoint}/getSettings`, {
      headers: {
        "Content-Type": "application/json"
      },
    }).then((res)=> {
      return res.json()
    }).then((res)=> {
      setSettingsData(res);
    }).finally(()=> {
      setLoadingSave(false);
    })

  }

  const updateSettingsFields = (field: string, value: any) => {
    setSettingsData({
      ...settingsData,
      [field]: value,
    })
  }

  const handleTestEmbeddings = () => {
    setLoadingTest(true);
    fetch(`${endPoint}/testEmbedding`, {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        input: testDocument,
      })
    }).then((res)=> {
      return res.json()
    }).then((res)=> {
      setTestResults(res.related);
    }).finally(()=> {
      setLoadingTest(false);
    })
  }

  useEffect(()=> {
    getSettings();
  }, [])

  return (
    <Container 
      style={{
        marginTop: 50,
      }}
    >
      <Box>
        <Section style={{paddingTop: 0, paddingBottom: 0, marginBottom: 15}}>
          <Heading size={3}>
            Embeddings
          </Heading>
          <Box shadowless style={{paddingTop: 0}}>
            <Section size="small" style={{paddingTop:0, paddingBottom: 0}}>
              <Heading size={4}>
                Create Embedding
              </Heading>
              {embeddingNotification}
              <Form.Field>
                <Form.Control>
                  <Form.Textarea
                    onChange={(e)=>setDocument(e.target.value)}
                    value={document}
                    placeholder="Input document"
                  />
                </Form.Control>
              </Form.Field>
              <Form.Field kind="group">
                <Form.Control>
                  <Button color="link" onClick={handleCreateEmbeddings} loading={loadingEmbedding}>Create Embedding</Button>
                </Form.Control>
              </Form.Field>
            </Section>
            <Section size="small" style={{paddingBottom: 0}}>
              <Heading size={4}>
                Test Embedding
              </Heading>
              <Form.Field>
                <Form.Control>
                  <Form.Textarea
                    onChange={(e)=>setTestDocument(e.target.value)}
                    value={testDocument}
                    placeholder="Input document"
                  />
                </Form.Control>
              </Form.Field>
              <Form.Field kind="group">
                <Form.Control>
                  <Button 
                    color="link"
                    onClick={handleTestEmbeddings}
                    loading={loadingTest}
                  >
                    Test Embedding Score
                  </Button>
                </Form.Control>
              </Form.Field>
              {(testResults && testResults.length > 0) && (
                <Table.Container>
                <Table>
                  <thead>
                    <tr>
                      <th>
                        Document
                      </th>
                      <th>
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {testResults.map((test)=> {
                      return (
                        <tr>
                          <td>
                            {test.input.substring(0, 100)}...
                          </td>
                          <td>
                            {test.score}
                          </td>
                        </tr>
                        );
                    })}
                  </tbody>
                </Table>
                </Table.Container>
              )}
            </Section>
          </Box>
        </Section>
        <Section style={{paddingTop: 0, paddingBottom: 0}}>
          <Heading size={3}>
            Settings
          </Heading>
          <Box shadowless> 
            <Form.Field>
              <Form.Control>
                <Form.Checkbox 
                  checked={settingsData.enableEmbedding}
                  onChange={(e)=>updateSettingsFields('enableEmbedding',e.target.checked)} 
                >
                  Enable Embeddings
                </Form.Checkbox>
              </Form.Control>
            </Form.Field>
            <Form.Field>
              <Form.Label>Minimum Score</Form.Label>
              <Form.Control>
                <Form.Input 
                  type="number" 
                  onChange={(e)=>updateSettingsFields('minimumScore',e.target.value)} 
                  placeholder="90" 
                  value={settingsData.minimumScore}
                />
              </Form.Control>
            </Form.Field>
            <Form.Field kind="group">
              <Form.Control>
                <Button 
                  color="link"
                  onClick={handleSaveSettings}
                  loading={loadingSave}
                >
                  Save
                </Button>
              </Form.Control>
            </Form.Field>
          </Box>
        </Section>
      </Box>
    </Container>
  );
}

export default Manage;
