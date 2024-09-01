<template>
  <div>
    <div class="flex items-center justify-center m-5 gap-3">
      <div class="max-w-screen-md w-full">
        <UiInput type="url" placeholder="https://vnexpress.net/rss/tin-moi-nhat.rss" v-model="input"/>
      </div>
      <UiButton :loading="loading" variant="outline" @click="rssQuery">
        <Icon :class="`h-5 w-5 ${loading ? 'animate-spin' : ''}`" :name="loading ? 'lucide:loader-2' : 'lucide:rss'">
        </Icon>
        <p v-show="loading">Please wait</p>
      </UiButton>
    </div>

    <div>
      <h1 class="flex justify-center">{{ rssData?.title }}</h1>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 m-4">
        <UiCard v-for="item in rssData?.entries" class="max-w-sm" :title="item.title" :description="item.description">
          <template #content>
            <UiCardContent>
              <ul class="mt-7 flex flex-col gap-2 pl-2 text-ellipsis overflow-hidden">
                <li v-for="url in item.relatedUrls" class="flex items-start gap-4">
                  <span class="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                  <div class="flex flex-col gap-px text-sm">
                    <a class="font-medium leading-none text-nowrap" :href="url" target="_blank">{{ url }}</a>
                  </div>
                </li>
              </ul>
            </UiCardContent>
          </template>
        </UiCard>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { extractFromXml } from '@extractus/feed-extractor'

const input = ref('');
const loading = ref(false);
const proxy = 'https://api.allorigins.win/get?url=';
const rssData = ref();


function toast(msg: string, type: "warning" | "default" | "success" | "info" | "destructive" = 'warning') {
  useToast().toast({
    title: "Message alert",
    icon: "lucide:badge-alert",
    description: msg,
    variant: type,
  })
}

async function rssQuery() {
  if (input.value.length == 0) {
    toast('Please enter URL of feed');
    return;
  }
  if (!isValidUrl(input.value)) {
    toast(`Invalid url '${input.value}'`);
    return;
  }

  loading.value = true;
  fetch(`${proxy}${encodeURIComponent(input.value)}`)
    .then(response => {
      loading.value = false;
      if (response.ok) return response.json()
      throw new Error('Network response was not ok.')
    })
    .then(data => {
      let xml = data.contents;
      if (xml.includes('base64')) {
        const base64content = xml.split(',')[1]
        const binaryData = Buffer.from(base64content, 'base64')
        xml = new TextDecoder("utf-8").decode(new Uint8Array(binaryData));
      }
      const feed = extractFromXml(xml, {
        getExtraEntryFields: (feedEntry) => {
          const content = JSON.stringify(feedEntry);
          const relatedUrls = extractURLs(content);
          return {
            relatedUrls: new Set(relatedUrls),
          }
        }
      })
      console.log(feed);
      rssData.value = feed;
    });
}


</script>