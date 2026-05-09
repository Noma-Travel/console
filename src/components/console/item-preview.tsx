import {
    Copy,
    Lock,
    MoreVertical,
} from "lucide-react"
  

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { cn } from "@/lib/utils";

import DialogPut from '@/components/console/dialog-put'
import ImagePreview from "@/components/console/image-preview"
import { getBlueprintIndexPathFieldSet, resolveDocumentTitle } from "@/lib/console_utils"


interface ItemPreviewProps { 
  selectedId: string;            
  refreshUp: () => void;         
  onDeleteId: (id: string) => void; 
  blueprint?: any;
  portfolio: string;
  org: string;
  ring: string;               
}


interface DataType {
  name?: string;
  _id?: string;
  [key: string]: any; // Additional properties
}

interface FieldDictionary {
  [key: string]: {
    widget?: string;
    hint?: string;
    label?: string;
  };
}

interface BlueprintField {
  name: string;
  widget?: string;
  hint?: string;
  label?: string;
}

function formatDetailValue(
  value: unknown,
  key: string,
  blueprint?: ItemPreviewProps["blueprint"],
): ReactNode {
  if (value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }
  if (value !== null && typeof value === "object") {
    return (
      <pre className="max-h-56 overflow-auto rounded-md border bg-muted/40 p-2.5 font-mono text-xs leading-relaxed whitespace-pre-wrap break-all [overflow-wrap:anywhere]">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  const resolved =
    blueprint?.rich?.[blueprint.sources?.[key]?.split(":")[0]]?.[value as string] ??
    value;

  const text = String(resolved);
  const trim = text.trim();
  const looksLikeJson =
    (trim.startsWith("{") && trim.endsWith("}")) ||
    (trim.startsWith("[") && trim.endsWith("]"));
  const isLong = text.length > 200;

  if (looksLikeJson || isLong) {
    return (
      <pre className="max-h-56 overflow-auto rounded-md border bg-muted/40 p-2.5 font-mono text-xs leading-relaxed whitespace-pre-wrap break-all [overflow-wrap:anywhere]">
        {text}
      </pre>
    );
  }

  return (
    <span className="break-words [overflow-wrap:anywhere]">{text}</span>
  );
}

export default function ItemPreview({selectedId,refreshUp,onDeleteId,blueprint,portfolio,org,ring}: ItemPreviewProps) {


    //const [data, setData] = useState({}); // State to hold table data
    const [data, setData] = useState<DataType>({});

    //const [loading, setLoading] = useState(true); // State to manage loading status
    const [error, setError] = useState<Error | null>(null);
    const [refresh, setRefresh] = useState(false);
    const [showCard, setShowCard] = useState(true);
    const [fieldsDictionary, setFieldsDictionary] = useState<FieldDictionary>({});

    const indexPathFields = useMemo(
        () => getBlueprintIndexPathFieldSet(blueprint),
        [blueprint],
    );

    useEffect(() => {
        if (!selectedId) {
            setData({});
            setShowCard(false);
            return;
        }

        const fetchData = async () => {
            try {
            const dataResponse = await fetch(`${import.meta.env.VITE_API_URL}/_data/${portfolio}/${org}/${ring}/${encodeURIComponent(selectedId)}`, {
                method: 'GET',
                headers: {
                'Authorization': `Bearer ${sessionStorage.accessToken}`,
                },
            });
            const response = await dataResponse.json();
            setData(response);
            setShowCard(true);
            } catch (err) {
              if (err instanceof Error) {
                setError(err);
              } else {
                setError(new Error("An unknown error occurred"));
              }
            }
        };

        void fetchData();
    }, [selectedId, portfolio, org, ring, refresh]);


    useEffect(() => {
        // Iterate through blueprint.fields and generate a dictionary where the key is the name and the content is the field object itself
        const dictionary: FieldDictionary = {};
        if (blueprint && blueprint.fields) {
            blueprint.fields.forEach((field: BlueprintField) => {
                dictionary[field.name] = field;
            });
        }
        setFieldsDictionary(dictionary);
    }, [blueprint]);




      
    // Function to update the state
    const refreshAction = () => {
        setRefresh(prev => !prev); // Toggle the `refresh` state to trigger useEffect
        refreshUp();

    };


    const handleDeleteId = (id: string) => {
      
      onDeleteId(id)
      setData({});
      setShowCard(false);
      
    };


    
    {/*

    // This is a temporary solution for the MVP. Ring names are hardcoded in the code #gross
    function GraphToShow({ name }: { name: string }) {
      let componentToRender;
  
      switch (name) {
          case 'usecase1':
              componentToRender = <GraphTimeseries2 />;
              break;
          case 'usecase2':
              componentToRender = <GraphBarchart />;
              break;
          case 'usecase3':
              componentToRender = <GraphComparisonBar />;
              break;
          case 'usecase4':
              componentToRender = <GraphRadial />;
              break;
          case 'usecase5':
              componentToRender = <GraphWave />;
              break;
          default:
              componentToRender = <div></div>;
      }
  
      return (   
        <div className="grid gap-3">
          {componentToRender}
        </div>
      );
    }

    */}

    return (

    <>
      <Card
        className="flex min-h-0 flex-1 flex-col"
      > 
        <CardHeader className="flex flex-row items-start gap-3 bg-muted/50">
          <div className="min-w-0 flex-1 grid gap-0.5">
            <CardTitle className="group flex min-w-0 items-center gap-2 text-lg">
            {(!selectedId || !showCard) ? (
              <span>All</span>
            ) : (
              <span className="min-w-0 break-words font-semibold leading-snug">
                {resolveDocumentTitle(data as Record<string, unknown>, blueprint)}
              </span>
            )}
              
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                disabled={!data._id}
                onClick={() => {
                  if (data._id) void navigator.clipboard.writeText(String(data._id));
                }}
              >
                <Copy className="h-3 w-3" />
                <span className="sr-only">Copy Item ID</span>
              </Button>
            </CardTitle>
            <CardDescription className={`break-all ${(!selectedId || !showCard) ? 'hidden' : ''}`}>
              id: {data._id}
            </CardDescription>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1">
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline" className="h-8 w-8">
                  <MoreVertical className="h-3.5 w-3.5" />
                  <span className="sr-only">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-gray-300">Export</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => handleDeleteId(selectedId)}
                >Trash</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-0 text-sm">
          {(!selectedId || !showCard) ? (
                <div className="p-6">
                  <span className="text-muted-foreground">Select an item from the list to see its details</span>
                </div>
              ) : (
                <Tabs defaultValue="friendly" className="flex min-h-0 flex-1 flex-col gap-0">
                  <TabsList className="mx-6 mt-4 w-fit shrink-0">
                    <TabsTrigger value="friendly">Fields</TabsTrigger>
                    <TabsTrigger value="raw">Raw JSON</TabsTrigger>
                  </TabsList>
                  <TabsContent value="friendly" className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-4 mt-0 data-[state=inactive]:hidden">
                    <ImagePreview blueprint={blueprint} data={data}/>
                    <div className="mt-6 min-w-0">
                      <div className="font-semibold">Item Details</div>
                      <ul className="mt-3 min-w-0 divide-y divide-border/60">
                      {Object.entries(fieldsDictionary).map(([key, fieldInfo]) => {
                          const value = data[key];
                          const isIndexKey = indexPathFields.has(key);
                          return fieldInfo?.widget !== 'image' && !key.startsWith('_') ? (
                              <li
                                  key={key}
                                  className={cn(
                                    "grid min-w-0 grid-cols-1 gap-3 py-3 sm:grid-cols-[minmax(7.5rem,11rem)_minmax(0,1fr)] sm:items-start sm:gap-x-4",
                                    isIndexKey && "rounded-md bg-muted/25 px-2 -mx-2",
                                  )}>
                                  <div className="flex min-w-0 items-center justify-between gap-2 sm:min-h-8 sm:pt-0.5">
                                    <span
                                      className={cn(
                                        "min-w-0 flex-1 text-sm font-medium leading-snug text-muted-foreground",
                                        isIndexKey && "text-muted-foreground/80",
                                      )}
                                    >
                                      {fieldInfo?.label}
                                    </span>
                                    {isIndexKey ? (
                                      <span
                                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-muted-foreground"
                                        title="This field is part of the document index (indexes.path) and cannot be edited."
                                      >
                                        <Lock className="h-4 w-4 opacity-60" aria-hidden />
                                        <span className="sr-only">Index field, not editable</span>
                                      </span>
                                    ) : (
                                      <DialogPut
                                          selectedKey={key}
                                          selectedValue={value}
                                          refreshUp={refreshAction}
                                          blueprint={blueprint}
                                          title="Edit attribute"
                                          instructions="Modify the attribute and click save."
                                          path={`${import.meta.env.VITE_API_URL}/_data/${portfolio}/${org}/${ring}/${selectedId}`}
                                          method='PUT'
                                      />
                                    )}
                                  </div>
                                  <div
                                    className={cn(
                                      "min-w-0 text-foreground",
                                      isIndexKey && "text-muted-foreground",
                                    )}
                                  >
                                    {formatDetailValue(value, key, blueprint)}
                                    {isIndexKey && (
                                      <p className="mt-2 text-xs leading-snug text-muted-foreground">
                                        Index key: this value is part of{" "}
                                        <code className="rounded bg-muted px-1 py-0.5 text-[0.7rem]">
                                          indexes.path
                                        </code>{" "}
                                        and cannot be changed after the document is created.
                                      </p>
                                    )}
                                  </div>
                              </li>
                          ) : null;
                      })}
                      </ul>
                    </div>
                  </TabsContent>
                  <TabsContent value="raw" className="min-h-0 flex-1 overflow-hidden px-6 pb-6 pt-4 mt-0 data-[state=inactive]:hidden">
                    <pre className="max-h-[min(60vh,32rem)] overflow-auto rounded-md border bg-muted/30 p-3 text-xs leading-relaxed">
                      {JSON.stringify(data, null, 2)}
                    </pre>
                  </TabsContent>
                </Tabs>
              )}
        </CardContent>
        <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
          <div className="text-xs text-muted-foreground">
            {data._modified ? (
              <>Last updated <time dateTime={String(data._modified)}>{String(data._modified)}</time></>
            ) : (
              <span className="text-muted-foreground/70">No item selected</span>
            )}
          </div>
        </CardFooter>
      </Card>
    </> 
    )
  }